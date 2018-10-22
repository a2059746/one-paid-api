import request from 'request';
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
    let client;
    try {
      client = await pool.connect();
    } catch(err) {
      console.log('connect error');
      console.log(err);
      return reject(err); // if no retrun, the program will still run
    }
    
    try {
      const query = {
        text: `UPDATE op_orders
                SET op_stc = $1,
                    op_m = $2,
                    op_pd = $3,
                    notice_time = $4
                WHERE op_tn = $5
                RETURNING o_id`,
        values: [
          queryObj.StatusCode,
          queryObj.Message,
          queryObj.PaymentDate,
          new Date().toISOString().slice(0, 19).replace('T', ' '),
          queryObj.TradeNo
        ]
      }
      const result1 = await client.query(query);
      const o_id = result1.rows[0].o_id;
      const notify = await selectVendorAndMember(o_id, client);
      console.log('================')
      console.log(notify);
      await notifyVendor(notify.v_key);
      //await confirmOrder(queryObj.MerID, queryObj.MerTradeNo, queryObj.SignCode);
      resolve('confirm order success');
    } catch(err) {
      console.log('query error1');
      console.log(err);
      reject(err);
    } finally {
      console.log('release');
      client.release();
      return;
    }
  })
}

const confirmOrder = (MerID, MerTradeNo, SignCode) => {
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

const notifyVendor = (v_key) => {
  return new Promise((resolve, reject) => {
    request.post({
      url: 'https://iintw.com/onesignal',
      form: {
        TITLE: 'Test',
        DESC: 'test content',
        UID: v_key,
        EVENT: 'CUSTOM_2',
        ADMIN: true
      }
    }, (err, res, body) => {
      if(err) {
        reject(err);
        return;
      }
      console.log('///*/-/*-/-')
      console.log(body);
      resolve(body);
    })
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