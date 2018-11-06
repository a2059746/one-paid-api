import express from 'express';
import * as orderCtrl from './order.controller';

const router = express.Router();

/* Post */
router.route('/co/:oid').post(orderCtrl.postOnePaidOrder);

export default router;