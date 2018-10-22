import express from 'express';
import {pgConfig} from '../../config/config';
import pg from 'pg';
import vendor from './pgslq/app/vendor/vendor.route';
import box from './pgslq/app/box/box.route';
import mail_member from './pgslq/app/mail_member/member.route';
import order from './pgslq/app/order/order.route';
import record from './pgslq/app/record/record.route';
import b_vendor from './pgslq/backsystem/vendor/vendor.route';
import b_box from './pgslq/backsystem/box/box.route';
import b_gift from './pgslq/backsystem/gift/gift.route';
import op_order from './pgslq/onepaid/order/order.route';

const router = express.Router();

router.get('/', (req, res) => {
  const client = new pg.Client({
    host: pgConfig.pgHost,
    user: pgConfig.pgUserName,
    password: pgConfig.pgPass,
    database: pgConfig.pgDatabase,
    post: pgConfig.pgPort,
    ssl: true
  });
  client.connect(err => {
    if(err) {
      res.send(err);
    } else {
      res.send('connect successfully');
      console.log('connect successfully')
    }
  })
})

/* routers */
router.use('/pg/vendor', vendor);
router.use('/pg/box', box);
router.use('/pg/mail_member', mail_member);
router.use('/pg/order', order);
router.use('/pg/record', record);

router.use('/pg/b/vendor', b_vendor);
router.use('/pg/b/box', b_box);
router.use('/pg/b/gift', b_gift);

router.use('/pg/op/order', op_order);

export default router;