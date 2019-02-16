import express from 'express';
import createOrder from './CreateOrder/route/co.route';
import confirmPayment from './ConfirmPayment/route/cp.route';
import request from 'request';
import { createSignCode } from './CreateOrder/createSignCode';
import iintwRoute from './CreateOrder/iintw/iintw.route';
const router = express.Router();

router.use('/iintw-order', iintwRoute);
/* routers */
router.use('/co', createOrder);
router.use('/cp', confirmPayment);
router.use('/getorder', (req, res) => {
    const order = req.body;
    if (!order['MerID'] || !order['MerTradeNo']) {
        res.json({
            err: '參數錯誤'
        })
    } else {
        order['SignCode'] = createSignCode(order);
        request.post('https://payment.onepaid.com/payment/queryorder', {
            formData: order,
        }, (rErr, rRes, rBody) => {
            if(rErr) {
                res.json({
                    err: rErr,
                });
                return 0;
            }
            res.json({
                result: rBody
            });
            return 1;
        });
    }
});

export default router;