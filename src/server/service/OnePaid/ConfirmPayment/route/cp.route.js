import express from 'express';
import * as cpCtrl from './cp.controller';

const router = express.Router();

router.route('/').post(cpCtrl.updateOrderStatus);

export default router;