import request from 'request';
import * as crawler from '../crawler';
import {createSignCode} from '../createSignCode'
import * as orderModule from '../../../../routes/pgslq/onepaid/order/order.module';

export const createOnePaidOrder = (order, o_id) => {
  return new Promise( async (resolve, reject) => {
    let res;
    try {
      res = await step1(order);
    } catch(err) {
      console.log('step1 error');
      console.log(err);
      reject(err);
      return;
    }

    try {
      res = await step2(res);
    } catch(err) {
      console.log('step2 error');
      console.log(err);
      reject(err);
      return;
    }

    try {
      res = await step3(res, o_id);
      console.log(res)
      resolve(res);
    } catch(err) {
      console.log('step3 error');
      console.log(err);
      reject(err);
      return;
    }

  })
}

// oder: from iintw app
const step1 = (order) => {
  const url = 'https://payment.onepaid.com/payment/payorder';
  const signCode = createSignCode(order.value, order.secCode)
  let op_order = order.value;
  op_order['SignCode'] = signCode;
  return postRequest(url, op_order, crawler.getOnePaidOrderKey);
}

// form: from One-Paid 'https://payment.onepaid.com/payment/payorder'
const step2 = (form) => {
  const url = `https://payment.onepaid.com${form.action}`;
  return postRequest(url, form.data, crawler.sendDataBack);
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
    request.post(url, {
      // url: url,
      formData: formData
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
  })
}