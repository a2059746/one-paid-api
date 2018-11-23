import request from 'request';
import { createSignCode } from '../../CreateOrder/createSignCode';
var OneSignal = require('onesignal-node');
const OneS = new OneSignal.Client({
	userAuthKey: 'YmY0ZjlmZDYtOWNjMC00MTAyLTg3MGQtMDQ5MzFmODhjYTNl',
	// note that "app" must have "appAuthKey" and "appId" keys
  app: {
    appAuthKey: 'ODVkYjUxMGYtMDJlMS00Y2EzLTgzYmEtMGMxMTk2YjE4OWMx',
    appId: '073a36e3-7be4-41cf-a031-28e14d2fe0f0'
  }
});

const firebase = require("firebase-admin");
var serviceAccount = require("../../../../../iintw-single-firebase-adminsdk-zzrlm-3b7ecc2991.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://iintw-single.firebaseio.com"
});
const fireDB = firebase.database();
const __PATH_PAY_LOGS = '/__REMIT__/__PAY_LOGS__/';
const __PATH_PAY_LOGS_ERROR = '/__REMIT__/__PAY_LOGS_ERROR__/';
const __PATH_REMIT_ORDERS = '/__REMIT__/__ORDERS__/';

import {Pool} from 'pg';
import {pgConfig} from '../../../../../config/config';

const pool = new Pool({
  host: pgConfig.pgHost,
  user: pgConfig.pgUserName,
  password: pgConfig.pgPass,
  database: pgConfig.pgDatabase,
  post: pgConfig.pgPort,
  ssl: true
});

/* Put */
export const updateOrderStatus = (queryObj) => {
  return new Promise( async (resolve, reject) => {
    console.log('================ ORDER START =================');
    console.log(queryObj);
    console.log('================ ORDER END =================');
    if (queryObj['StatusCode']) {
      queryObj['_cbt'] = new Date().getTime();
      fireDB.ref(__PATH_PAY_LOGS).push(queryObj);
      if (queryObj['MerTradeNo']) {
        let update = {
          'RO_t': (queryObj['StatusCode'] === 10001)? '00100' : '09000',
          'RO_c': (queryObj['StatusCode'] === 10001)? '訂單已完成' : '訂單異常',
          'ROP_PaymentDate': queryObj['PaymentDate'],
          'ROP_PTime': new Date(queryObj['PaymentDate'] + ' GMT+0800').getTime(),
          _OnePaid: JSON.stringify(queryObj),
        };
        fireDB.ref(__PATH_REMIT_ORDERS)
        .orderByChild('RO_Id')
        .equalTo(queryObj['MerTradeNo'])
        .once('value').then(snap => {
          let scc = false;
          let obj = snap.val();
          console.log(obj)
          if(!obj) {
            console.log('>>> 找不到訂單!!');
            fireDB.ref(__PATH_PAY_LOGS_ERROR).push(Object.assign({_ERROR: '找不到訂單'}, queryObj));
            return 0;
          }
          Object.keys(obj).forEach(key => {
            scc = true;
            fireDB.ref(__PATH_REMIT_ORDERS + key).update(update).then(res => {
              confirmOrder(queryObj.MerID, queryObj.MerTradeNo);
            });
          });
          if(scc) {
            notifyVendor(queryObj['MerTradeNo'], queryObj['TotalAmt'])
            .then(scc => {
              console.log('>>> 成功發送通知');
            }, err => {
              console.log('>>> 失敗發送通知');
              console.log(err)
              fireDB.ref(__PATH_PAY_LOGS_ERROR).push(Object.assign({_ERROR: '失敗發送通知'}, queryObj));
            })
          } else {
            console.log('>>> 找不到訂單');
            fireDB.ref(__PATH_PAY_LOGS_ERROR).push(Object.assign({_ERROR: '找不到訂單'}, queryObj));
          }
        });
      } else {
        fireDB.ref(__PATH_PAY_LOGS_ERROR).push(Object.assign({_ERROR: '萬付通CB異常'}, queryObj));
      }
      
      resolve(true);
    } else {
      reject('ERR');
    }
  });
  
  
    // await notifyVendor(notify.v_key);
  // return new Promise( async (resolve, reject) => {
    
  //   // let client;
  //   // try {
  //   //   client = await pool.connect();
  //   // } catch(err) {
  //   //   console.log('connect error');
  //   //   console.log(err);
  //   //   return reject(err); // if no retrun, the program will still run
  //   // }
    
  //   // try {
  //   //   const query = {
  //   //     text: `UPDATE op_orders
  //   //             SET op_stc = $1,
  //   //                 op_m = $2,
  //   //                 op_pd = $3,
  //   //                 notice_time = $4
  //   //             WHERE op_tn = $5
  //   //             RETURNING o_id`,
  //   //     values: [
  //   //       queryObj.StatusCode,
  //   //       queryObj.Message,
  //   //       queryObj.PaymentDate,
  //   //       new Date().toISOString().slice(0, 19).replace('T', ' '),
  //   //       queryObj.TradeNo
  //   //     ]
  //   //   }
  //   //   const result1 = await client.query(query);
  //   //   const o_id = result1.rows[0].o_id;
  //   //   const notify = await selectVendorAndMember(o_id, client);
  //   //   console.log('================')
  //   //   console.log(notify);
  //   //   await notifyVendor(notify.v_key);
  //   //   //await confirmOrder(queryObj.MerID, queryObj.MerTradeNo, queryObj.SignCode);
  //   //   resolve('confirm order success');
  //   // } catch(err) {
  //   //   console.log('query error1');
  //   //   console.log(err);
  //   //   reject(err);
  //   // } finally {
  //   //   console.log('release');
  //   //   client.release();
  //   //   return;
  //   // }
  // })
}

const confirmOrder = (MerID, MerTradeNo) => {
  return new Promise((resolve, reject) => {
    let formdata = {
      MerID: MerID,
      MerTradeNo: MerTradeNo,
    }
    request.post({
      url: 'https://payment.onepaid.com/payment/confirmorder',
      form: {
        MerID: MerID,
        MerTradeNo: MerTradeNo,
        signCode: createSignCode(formdata),
      }
    }, (err, res, body) => {
      if(err) {
        reject(err);
        return;
      }
      resolve(body);
    })
  })
}

const selectVendorAndMember = (o_id, client) => {
  return new Promise( async (resolve, reject) => {
    try {
      const query = {
        text: `SELECT v.v_key, m.m_phone FROM "vendor" v, "mail_member" m, "orders" o WHERE o.v_id = v.v_id and o.m_id = m.m_id and o.o_id = $1`,
        values: [o_id]
      }
      const result = await client.query(query);
      resolve(result.rows[0]);
    } catch(err) {
      console.log('query error2');
      console.log(err);
      reject(err);
    } 
  })
}

export const notifyVendor = (RO_Id, TotalAmt) => {
  return new Promise((resolve, reject) => {
    // request.post({
    //   url: 'https://iintw.com/onesignal',
    //   form: {
    //     TITLE: 'Test',
    //     DESC: 'test content',
    //     UID: v_key,
    //     EVENT: 'CUSTOM_2',
    //     ADMIN: true
    //   }
    // }, (err, res, body) => {
    //   if(err) {
    //     reject(err);
    //     return;
    //   }
    //   console.log('///*/-/*-/-')
    //   console.log(body);
    //   resolve(body);
    // })
    try {
      TotalAmt = parseInt(TotalAmt);
      let NotiObj = new OneSignal.Notification({
        headings:  { en: `收到新的繳費！` },
          contents: {
              en: `訂單編號「${RO_Id}」成功繳款 ${TotalAmt} 元！`,
          },
          filters: [
            { field: 'tag', key: 'REMIT', value: 'TRUE' },
          ],
      });
      // let filters = [
      //   { field: 'tag', key: 'REMIT', value: 'TRUE' },
      // ];
      // NotiObj.setFilters(filters);
      // NotiObj.setParameter('headings', { en: `收到新的繳費！` });
      OneS.sendNotification(NotiObj, function (err, httpResponse, data) {
        if (err || data['errors']) {
            reject({
                err: true,
                msg: (data['errors']) ? data['errors'] : 'OneSignal sendNotification ERROR',
            });
        } else {
            resolve({
                err: false,
                msg: 'done!',
            });
        }
      });

    } catch ($e) {
      reject({
        err: true,
        msg: $e,
      });
    }
  })
}

const notifyMember = (m_phone) => {
  return new Promise((resolve, reject) => {
    request.post({
      url: 'https://payment.onepaid.com/payment/confirmorder',
      form: {
        MerID: MerID,
        MerTradeNo: MerTradeNo,
        SignCode: SignCode
      }
    }, (err, res, body) => {
      if(err) {
        reject(err);
        return;
      }
      resolve(body);
    })
  })
}