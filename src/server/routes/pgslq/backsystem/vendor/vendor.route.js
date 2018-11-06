import express from 'express';
import * as vendorCtrl from './vendor.controller';

const router = express.Router();

/* Get */
router.route('/info/:vkey').get(vendorCtrl.vendorGetInfo);
router.route('/introandbullletin/:vid').get(vendorCtrl.vendorGetIntroAndBulletin);

/* Post */
router.route('/').post(vendorCtrl.vendorCreate);

/* Put */
router.route('/info/:vid').put(vendorCtrl.vendorPutInfo);
router.route('/introandbullletin/:vid').put(vendorCtrl.vendorPutIntroAndBulletin);

export default router;