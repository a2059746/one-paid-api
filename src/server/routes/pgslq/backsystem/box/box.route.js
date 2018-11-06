import express from 'express';
import * as boxCtrl from './box.controller';

const router = express.Router();

/* Get */
router.route('/vendor/:vid').get(boxCtrl.vendorGetBoxList);
router.route('/:bid').get(boxCtrl.vendorGetBox);
router.route('/:bid/gift').get(boxCtrl.boxGetGifts);
router.route('/:bid/twarea').get(boxCtrl.boxGetTwarea);

/* Post */
router.route('/').post(boxCtrl.vendorPostBox);
router.route('/:bid/gift/:gid').post(boxCtrl.boxPostGift);
router.route('/:bid/twarea/:tcode').post(boxCtrl.boxPostTwarea);

/* Put */
router.route('/:bid').put(boxCtrl.vendorPutBox);

/* Delete */
router.route('/:bid').delete(boxCtrl.vendorDeleteBox);
router.route('/:bid/gifts/:gid').delete(boxCtrl.deleteBoxGift);
router.route('/:bid/twarea/:tcode').delete(boxCtrl.deleteBoxTwarea);

export default router;