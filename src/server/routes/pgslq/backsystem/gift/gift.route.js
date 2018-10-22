import express from 'express';
import * as giftCtrl from './gift.controller';

const router = express.Router();

/* Get */
router.route('/vendor/:vid').get(giftCtrl.vendorGetGiftList);
// router.route('/:bid').get(boxCtrl.vendorGetBox);
// router.route('/:bid/gift').get(boxCtrl.boxGetGifts);
// router.route('/:bid/twarea').get(boxCtrl.boxGetTwarea);

/* Post */
router.route('/').post(giftCtrl.vendorPostGift);
// router.route('/:bid/gift/:gid').post(boxCtrl.boxPostGift);
// router.route('/:bid/twarea/:tcode').post(boxCtrl.boxPostTwarea);

/* Put */
router.route('/:gid').put(giftCtrl.vendorPutGift);

/* Delete */
router.route('/:gid').delete(giftCtrl.vendorDeleteGift);
// router.route('/:bid/gifts/:gid').delete(boxCtrl.deleteBoxGift);
// router.route('/:bid/twarea/:tcode').delete(boxCtrl.deleteBoxTwarea);

export default router;