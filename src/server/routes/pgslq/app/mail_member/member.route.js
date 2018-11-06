import express from 'express';
import * as memberCtrl from './member.controller';

const router = express.Router();

router.route('/:phone/:tw_area').get(memberCtrl.memberGetReceiveAddr);

export default router;