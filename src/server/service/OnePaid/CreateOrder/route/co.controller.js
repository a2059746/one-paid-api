import * as coModule from './co.module';

export const postOnePaidOrder = async (req, res) => {
  const order = req.body;
  const o_id = req.params.oid;
  try {
    await coModule.createOnePaidOrder(order, o_id).then(scc => {
      res.json({
        result: scc
      })
    }, err => {
      res.json({
ex:1,
        result: null,
        err: err,
      })
    });
  } catch(err) {
    res.json({
ex:2,
      result: null,
      err: err
    })
  }
}
