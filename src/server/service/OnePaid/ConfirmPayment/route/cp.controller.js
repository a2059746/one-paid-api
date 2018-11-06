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
      result: null,
      err: err
    })
  }
}
export const notify = async (req, res) => {
  const queryObj = req.body;
  cpModule.notifyVendor('NOTIFY TEST', 999).then(scc => {
    res.json(scc);
  }, err => {
    res.json(err);
  });
}
/**
 * 
 * 
 * 
 */