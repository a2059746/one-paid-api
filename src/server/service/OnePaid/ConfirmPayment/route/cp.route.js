import express from 'express';
import * as cpCtrl from './cp.controller';

const router = express.Router();

router.route('/').post(cpCtrl.updateOrderStatus);
router.route('/notify').post(cpCtrl.notify);

export default router;