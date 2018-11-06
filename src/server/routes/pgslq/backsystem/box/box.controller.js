import * as boxModule from './box.module';

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
export const vendorGetBoxList = async (req, res) => {
  const v_id = req.params.vid;
  try {
    const result = await boxModule.selectVendorBoxList(v_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

export const vendorGetBox = async (req, res) => {
  const b_id = req.params.bid;
  try {
    const result = await boxModule.selectVendorBox(b_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

export const boxGetGifts = async (req, res) => {
  const b_id = req.params.bid;
  try {
    const result = await boxModule.selectBoxGifts(b_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

export const boxGetTwarea = async (req, res) => {
  const b_id = req.params.bid;
  try {
    const result = await boxModule.selectBoxTwarea(b_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

/* Post */
export const vendorPostBox = async (req, res) => {
  const queryObj = req.body;
  try {
    const result = await boxModule.createVendorBox(queryObj);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

export const boxPostGift = async (req, res) => {
  const b_id = req.params.bid;
  const g_id = req.params.gid;
  try {
    const result = await boxModule.createBoxGift(b_id, g_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

export const boxPostTwarea = async (req, res) => {
  const b_id = req.params.bid;
  const t_code = req.params.tcode;
  try {
    const result = await boxModule.createBoxTwarea(b_id, t_code);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}


/* Put */
export const vendorPutBox = async (req, res) => {
  const queryObj = req.body;
  const b_id = req.params.bid;
  try {
    const result = await boxModule.updateBox(queryObj, b_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

/* Delete */
export const vendorDeleteBox = async (req, res) => {
  const b_id = req.params.bid;
  try {
    const result = await boxModule.deleteBox(b_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

export const deleteBoxGift = async (req, res) => {
  const b_id = req.params.bid;
  const g_id = req.params.gid;
  try {
    const result = await boxModule.deleteBoxGift(b_id, g_id);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}

export const deleteBoxTwarea = async (req, res) => {
  const b_id = req.params.bid;
  const t_code = req.params.tcode;
  try {
    const result = await boxModule.deleteBoxTwarea(b_id, t_code);
    res.json(successRes(result));
  } catch(err) {
    res.json(errorRes(err));
  }
}