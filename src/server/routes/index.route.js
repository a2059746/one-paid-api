import express from 'express';
import {config} from './../../config/config';
import mysql from 'mysql';
import test from './test/test.route';
import vendor from './vendor/vendor.route';

const router = express.Router();

/* GET localhost:[port]/api page. */
router.get('/', (req, res) => {
  res.send(`此路徑是: localhost:${config.port}/api`);
});

router.get('/json', (req, res) => {
  res.json({
    'name': 'Tim',
    'age': '23',  
    'sex': 'Male',
    'look': 'Very Handsome',
  })
})

router.get('/sqlTest', (req, res) => {
  const connectionPool = mysql.createPool({
    connectionLimit: 10,
    host: config.mysqlHost,
    user: config.mysqlUserName,
    password: config.mysqlPass,
    database: config.mysqlDatabase
  })

  connectionPool.getConnection((err, connection) => {
    if(err) {
      res.send(err);
      console.log('connect fail');
      
    } else {
      res.send('connect successfully');
      console.log(connection)
    }
  })
})

/***** routers *****/
router.use('/test', test);
router.use('/vendor', vendor);

export default router;