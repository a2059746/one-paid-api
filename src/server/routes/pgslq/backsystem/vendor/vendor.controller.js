import * as vendorModule from './vendor.module';

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
export const vendorGetInfo = async (req, res) => {
  const v_key = req.params.vkey;
  try {
    const result = await vendorModule.selectVendorInfo(v_key);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

export const vendorGetIntroAndBulletin = async (req, res) => {
  const v_id = req.params.vid;
  try {
    const result = await vendorModule.selectVendorIntroAndBulletin(v_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

/* Post */
export const vendorCreate = async (req, res) => {
  const queryObj = req.body;
  try {
    const result = await vendorModule.createVendor(queryObj);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}


/* Put */
export const vendorPutInfo = async (req, res) => {
  const queryObj = req.body;
  const v_id = req.params.vid;
  try {
    const result = await vendorModule.updateVendorInfo(queryObj, v_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

export const vendorPutIntroAndBulletin = async (req, res) => {
  const queryObj = req.body;
  const v_id = req.params.vid;
  try {
    const result = await vendorModule.updateVendorIntroAndBulletin(queryObj, v_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}