import * as coModule from './co.module';

export const postOnePaidOrder = async (req, res) => {
  const order = req.body;
  const o_id = req.params.oid;
  try {
    const result = await coModule.createOnePaidOrder(order, o_id);
    res.json({
      result: result
    })
  } catch(err) {
    res.json({
      result: {},
      err: err
    })
  }
}