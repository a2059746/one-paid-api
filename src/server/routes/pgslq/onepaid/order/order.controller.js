import * as orderModule from './order.module';

function successRes(result) {
  return {
    result: result,
    err: false,
  }
}

function errorRes(err) {
  return {
    result: {},
    err: true,
    errMessage: err,
  }
}

/* Post */
export const postOnePaidOrder = async (req, res) => {
  const queryObj = req.body;
  const o_id = req.params.oid;
  try {
    const result = await orderModule.createOnePaidOrder(queryObj, o_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}