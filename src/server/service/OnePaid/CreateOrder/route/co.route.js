import express from 'express';
import * as coCtrl from './co.controller';

const router = express.Router();
router.route('/crawer').post(coCtrl.postCrawer);
router.route('/:oid').post(coCtrl.postOnePaidOrder);

export default router;