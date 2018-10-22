import express from 'express';
import * as recordCtrl from './record.controller';

const router = express.Router();

/* Get */
router.route('/phone/:phone').get(recordCtrl.customerGetOrderRecord);
router.route('/:oid').get(recordCtrl.recordGetInfo);

export default router;