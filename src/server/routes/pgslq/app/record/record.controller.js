import * as recordModule from './record.module';

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

/* Get */
export const customerGetOrderRecord = async (req, res) => {
  const m_phone = req.params.phone;
  try {
    const result = await recordModule.selectCustomerOrderRecord(m_phone);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

export const recordGetInfo = async (req, res) => {
  const o_id = req.params.oid;
  try {
    const result = await recordModule.selectRecordInfo(o_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}