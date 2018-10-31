import express from 'express';
import {config} from './config';
// import index from '../server/routes/index.route';
import pgIndex from '../server/routes/pgIndex.route';
import opIndex from '../server/service/OnePaid/opIndex.route';

import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import ev from 'express-validation';



const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors());

app.use(morgan('dev'));

/* GET home page. */
app.get('/', (req, res) => {
  res.send(`server started on  port http://127.0.0.1:${config.port} (${config.env})`);
});

// app.use('/api', index);
app.use('/api', pgIndex);
app.use('/api/op', opIndex);

app.use((err, req, res, next) => {
  if (err instanceof ev.ValidationError) return res.status(err.status).json(err);
})

export default app;