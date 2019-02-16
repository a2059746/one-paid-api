import * as coModule from './iintw.module';
import * as crawler from '../crawler';

export const postCrawer = async (req, res) => {
  const order = req.body;
  if (!order['body']) { res.json({err: '回傳參數錯誤'});  return 0; }
  res.json({err: false, result: crawler.sendDataBack(order['body']) });
};

export const postOnePaidOrder = async (req, res) => {
  const order = req.body;
  const o_id = req.params.oid;
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  try {
    await coModule.createOnePaidOrder(order, ip).then(scc => {
      res.json({
        err: false,
        // result: scc,
        data: scc,
      })
    }, err => {
      console.log(err)
      res.json({
        result: null,
        err: err,
      })
    });
  } catch(err) {
    res.json({
      result: null,
      err: err
    })
  }
}