import express from 'express';
import createOrder from './CreateOrder/route/co.route';
import confirmPayment from './ConfirmPayment/route/cp.route'

const router = express.Router();

/* routers */
router.use('/co', createOrder);
router.use('/cp', confirmPayment);

export default router;