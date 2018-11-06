import * as giftModule from './gift.module';

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
export const vendorGetGiftList = async (req, res) => {
  const v_id = req.params.vid;
  try {
    const result = await giftModule.selectVendorGiftList(v_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

/* Post */
export const vendorPostGift = async (req, res) => {
  const queryObj = req.body;
  try {
    const result = await giftModule.createVendorGift(queryObj);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

/* Put */
export const vendorPutGift = async (req, res) => {
  const queryObj = req.body;
  const g_id = req.params.gid;
  try {
    const result = await giftModule.updateGift(queryObj, g_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

/* Delete */
export const vendorDeleteGift = async (req, res) => {
  const g_id = req.params.gid;
  try {
    const result = await giftModule.deleteGift(g_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}