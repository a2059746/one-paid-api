import vendorModule from './vendor.module';

/* Get */
// const vendorGetAll = (req, res) => {
//   vendorModule.selectAllVendors().then((result) => {
//     return res.send(result);
//   }).catch((err) => {
//     return res.send(err);
//   })
// }

const vendorGetAll = async (req, res) => {
  try {
    const result = await vendorModule.selectAllVendors();
    return res.json({
      result: result,
    });
  } catch(err) {
    console.log('send error');
    return res.send(err);
  }
}

const vendorGetIntro = async (req, res) => {
  try {
    let id = req.params.id;
    let lang = req.params.lang;
    const result = await vendorModule.selectVendorIntro(id, lang);
    return res.json({
      result,
    });
  } catch(err) {
    return res.send(err);
  }
}

const vendorGetBoxes = async (req, res) => {
  try {
    const id = req.params.id;
    const tw_area_name = req.params.tw_area_name;
    const result = await vendorModule.selectVendorBoxes(id, tw_area_name);
    return res.json({ result });
  } catch(err) {
    return res.send(err);
  }
}

export default {
  vendorGetAll,
  vendorGetIntro,
  vendorGetBoxes
};