import express from 'express';
import * as orderCtrl from './order.controller';

const router = express.Router();

/* Get */
router.route('/vendor/:vid').get(orderCtrl.vendorGetOnePaidInfo);

/* Post */
router.route('/').post(orderCtrl.orderPut);

export default router;