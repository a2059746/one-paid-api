import express from 'express';
import {config} from './config';
// import index from '../server/routes/index.route';
import pgIndex from '../server/routes/pgIndex.route';
import opIndex from '../server/service/OnePaid/opIndex.route';

import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import ev from 'express-validation';

import * as cpCtrl from '../server/service/OnePaid/ConfirmPayment/route/cp.controller';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors());

app.use(morgan('dev'));
console.log('????????????????????????????')
/* GET home page. */
// app.get('/', (req, res) => {
//   res.send(`server started on  port http://127.0.0.1:${config.port} (${config.env})`);
// });
// app.post('/', cpCtrl.updateOrderStatus);
app.use('/',express.static('/home/yiyo/one-paid-api/html/'));

// app.use('/api', index);
app.use('/api', pgIndex);
app.use('/api/op', opIndex);
console.log('angular folder: ' + __dirname + 'html');
app.use('*', function(req, res, next) {
  res.sendFile('/home/yiyo/one-paid-api/html/index.html');
})
app.use((err, req, res, next) => {
  if (err instanceof ev.ValidationError) return res.status(err.status).json(err);
  // res.sendFile('/home/yiyo/one-paid-api/html/index.html');
})

export default app;