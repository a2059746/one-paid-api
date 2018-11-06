import express from 'express';
import * as coCtrl from './co.controller';

const router = express.Router();

router.route('/:oid').post(coCtrl.postOnePaidOrder);

export default router;