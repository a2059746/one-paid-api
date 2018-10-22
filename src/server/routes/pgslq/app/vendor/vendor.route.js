import express from 'express';
import vendorCtrl from './vendor.controller';

const router = express.Router();

router.route('/').get(vendorCtrl.vendorGetAll);
router.route('/:id/:lang').get(vendorCtrl.vendorGetIntro);
router.route('/:id/box/:tw_area_name').get(vendorCtrl.vendorGetBoxes);

export default router;