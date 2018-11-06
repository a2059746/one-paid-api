import vendorModule from './vendor.module';

/* Get */
const vendorGetAll = (req, res) => {
  vendorModule.selectAllVendors().then((result) => {
    return res.send(result);
  }).catch((error) => {
    return res.send(error);
  })
}

export default {
  vendorGetAll,
}