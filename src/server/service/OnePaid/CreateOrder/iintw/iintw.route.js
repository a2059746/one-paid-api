import express from 'express';
import * as coCtrl from './iintw.controller';

const router = express.Router();
router.route('/crawer').post(coCtrl.postCrawer);
router.route('/').post(coCtrl.postOnePaidOrder);

export default router;