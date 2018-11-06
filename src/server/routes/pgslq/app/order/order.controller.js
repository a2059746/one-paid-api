import * as orderModule from './order.module.2';

/* Get */
export const vendorGetOnePaidInfo = async (req, res) => {
  const v_id = req.params.vid;
  try {
    const result = await orderModule.selectVendorOnePadiInfo(v_id);
    res.json({
      result
    })
  } catch(err) {
    res.send(err);
  }
}

/* Put */
export const orderPut = async (req, res) => {
  const orderValue = req.body;
  try {
    const result = await orderModule.createOrderTranscations(orderValue);
    res.json({
      result,
    });
  } catch(err) {
    res.send(err);
  }
}