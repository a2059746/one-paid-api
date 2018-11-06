import express from 'express';
import testCtrl from './test.controller';
import validate from 'express-validation';
import paramValidation from '../../../config/param-validation'

const router = express.Router();

router.route('/').post(validate(paramValidation.createTest), testCtrl.testPost);
router.route('/').get(testCtrl.testGetAll);
router.route('/:testName').put(testCtrl.testPut);
router.route('/:testName').delete(testCtrl.testDelete);

export default router;