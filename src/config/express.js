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
var corsOptionsDelegate = function (req, callback) {
  // let from = req.header('Origin') || 'local';
  // console.log('>>> CORS: From "'+ from+ '"');
  // var corsOptions;
  // if (whitelist.indexOf(from) !== -1) {
  //   corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  // }else{
  //   console.log('>>> CORS: Reject!!!');
  //   corsOptions = { origin: false } // disable CORS for this request
  // }
	corsOptions = { origin: true };
  callback(null, corsOptions) // callback expects two parameters: error and options
}
// app.use(cors(corsOptionsDelegate));
// app.options('*', cors())
console.log('CORS!');
app.use(cors());

app.use(morgan('dev'));

/* GET home page. */
// app.get('*', (req, res) => {
//   res.send(`server started on  port http://127.0.0.1:${config.port} (${config.env})`);
// });
// app.use('/',express.static(__dirname + '/html'));
// app.use((err, req, res, next) => {
//   if (err instanceof ev.ValidationError) {
//     console.log('REDIRECT')
//     res.redirect('/');
//     return 0;
//   }//return res.status(err.status).json(err);
// })

app.get('*', https_redirect);
app.use('/',express.static('/home/yiyo/one-paid-api/dist/'));
app.get('/front', function(req, res) {
    res.redirect('/');
});
app.get('/front/*', function(req, res) {
  res.redirect('/');
});
// app.use('/api', index);
app.use('/api', pgIndex);
app.use('/api/op', opIndex);
// app.get('/*', function(req, res) {
//   res.send('NOT fOUND');
// });
// app.use(express.static('/home/yiyo/one-paid-api/html/'));
// app.get('*', function(req, res) {
//   res.redirect('/');
// });

export default app;

function https_redirect(req,res,next) {
  let schema = (req.headers['x-forwarded-proto'] || '').toLowerCase();
  if (req.headers.host.indexOf('localhost')<0 && schema!=='https') {
    res.redirect('https://' + req.headers.host + req.url);
  } else {
    next();
  }
};