import express from 'express';
import vendorCtrl from './vendor.controller';

const router = express.Router();

router.route('/').get(vendorCtrl.vendorGetAll);

export default router;