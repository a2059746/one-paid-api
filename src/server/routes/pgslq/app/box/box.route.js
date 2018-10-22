import express from 'express';
import * as boxCtrl from './box.controller';

const router = express.Router();

router.route('/gift').post(boxCtrl.boxGetGifts);

export default router;