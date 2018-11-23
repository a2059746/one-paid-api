import request from 'request';
import * as crawler from '../crawler';
import {createSignCode} from '../createSignCode'
import * as orderModule from '../../../../routes/pgslq/onepaid/order/order.module';
import * as dateFormat from 'dateformat';
import { config } from '../../../../../config/config';
/**
 * ORDER TYPE
 * @param {Object} order 
 * @param {string} order.value.MerID - 商家編號 C018091320000001
 * @param {*} order.value.MerTradeNo -
 * @param {*} order.value.MerTradeDate -
 * @param {*} order.value.PaymentType - 37
 * @param {*} order.value.ProductName - 
 * @param {*} order.value.CurrencyType - 1
 * @param {*} order.value.TotalAmt -
 * @param {*} order.value.ReturnUrl - http://149.28.146.174/api/op/cp/
 * @param {*} order.value.Remark -
 * @param {*} order.value.CustomeArgs -
 * @param {*} order.value.ShowResult - 0
 * @param {*} order.value.SignCode -
 * @param {*} order.secCode - 商店金鑰 9184c6821c5b4713937d26a305fd1353
 * 
 */
export const createOnePaidOrder = (order, o_id) => {

  return new Promise( async (resolve, reject) => {
    if(!order['value']) { reject(''); }

    order['secCode'] = config.secCode; // 
    order['value'].MerID = config.MerID;
    order['value'].MerTradeDate = dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
    order['value'].PaymentType = 37;
    order['value'].CurrencyType = 1;
    order['value'].ReturnUrl = 'http://149.28.146.174/api/op/cp/';
    order['value'].ShowResult = 0;
    let res;
    try {
      await step1(order).then(scc => {
        res = scc;
        // resolve(scc);
      }, err => {
        console.log('step1 error');
        console.log(err);
        reject(err);
      });
      // return ;
    } catch(err) {
      console.log('step1 error');
      console.log(err);
      reject(err);
      return;
    }

    try {
      console.log('============= GOGOGO');
      console.log(res);
      await step2(res).then(result => {
        resolve(result);
      }, err => {
        reject(err);
      });
      return;
      
    } catch(err) {
      console.log('step2 error');
      console.log(err);
      reject(err);
      return;
    }

    // try {
    //   res = await step3(res, o_id);
    //   console.log(res)
    //   resolve(res);
    // } catch(err) {
    //   console.log('step3 error');
    //   console.log(err);
    //   reject(err);
    //   return;
    // }

  })
}

// oder: from iintw app
const step1 = (order) => {
  const url = 'https://payment.onepaid.com/payment/payorder';
  const signCode = createSignCode(order.value);
  let op_order = order.value;
  op_order['SignCode'] = signCode;
  console.log('======== TO payorder ===========')
  console.log(order.value);
  console.log('======== =========== ===========')
  // return Promise.resolve({});
  return postRequest(url, op_order, crawler.getOnePaidOrderKey);
}

// form: from One-Paid 'https://payment.onepaid.com/payment/payorder'
const step2 = (form) => {
  if (form['err']) {
    return Promise.reject(form['err']);
  } else {
    const url = `https://payment.onepaid.com${form.action}`;
    // return postRequest(url, form.data, crawler.sendDataBack);
    return new Promise((reso, reje) => {
      console.log('====GOGO===')
      request.post('https://payment.onepaid.com/CVNStore', {
        header: {
              "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) chrome/56.0.2924.87 Safari/537.36"
              },
              json: form.data
      }, (error, res, body) => {
        if (error) {
          console.error(error)
          reje(error)
          return ;
        }
        console.log(`statusCode: ${res.statusCode}`)
        const result = crawler.sendDataBack(body);
        reso(result);
      })
     
    })
    

  }
  
}

// form: from One-Paid 'https://payment.onepaid.com${form.action}'
const step3 = (form, o_id) => {
  // console.log('=====step3=====');
  // console.log(form);
  // console.log(o_id);
  //const url = `http://localhost:3000/api/pg/op/order/co/${o_id}`;
  //return postRequest(url, form, null)
  return orderModule.createOnePaidOrder(form, o_id);
}

function postRequest(url, formData, crawlerF) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      request.post(url, {
        header: {
          "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) chrome/56.0.2924.87 Safari/537.36"
        },
        // url: url,
        json: formData
      }, (err, res, body) => {
        if(err) {
          reject(err);
          return;
        }
        if(crawlerF) {
          const result = crawlerF(body);
          resolve(result);
        } else {
          resolve(body);
        }
      })
    }, 200);
  })
}