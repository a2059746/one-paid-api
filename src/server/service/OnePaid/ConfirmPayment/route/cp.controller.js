import * as cpModule from './cp.module';

export const updateOrderStatus = async (req, res) => {
  const queryObj = req.body;
  try {
    const result = await cpModule.updateOrderStatus(queryObj);
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