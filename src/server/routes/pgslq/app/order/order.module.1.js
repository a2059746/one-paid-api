import {Pool} from 'pg';
import {pgConfig} from '../../../../config/config';

const pool = new Pool({
  host: pgConfig.pgHost,
  user: pgConfig.pgUserName,
  password: pgConfig.pgPass,
  database: pgConfig.pgDatabase,
  post: pgConfig.pgPort,
  ssl: true
});


const prodShouldAbort = async (err, client, done, reject) => {
  console.error('Error in transaction', err.stack)
  try {
    const res = await proQuery(client, 'ROLLBACK');
    console.log('Success rolling back client', res);
  } catch($err) {
    console.log('Error rolling back client', $err.stack);
  }
  // await proQuery(client, 'ROLLBACK').then(res => {
  //     console.log('Error rolling back client', res);
  // }, err => {
  //   if (err) {
  //     console.log('Error rolling back client', err.stack);
  //   }
  // });
  done();
  reject(true);
  return !!err;
}
function proQuery(client, sql) {
  return new Promise((resolve, reject) => {
    client.query(sql, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}
/* Post */
export const createOrderTranscations = (queryObj) => {
  console.log(queryObj)
  return new Promise((resolve, reject) => {
    pool.connect((error, client, done) => {
      if(error) {
        done();
        console.log(error)
        return reject(error);
      }
      try {
        proQuery(client, 'BEGIN').then(res => {
          // PROCEDURE 1
          return prod1GetUserInfo(client, queryObj);
        }, err => {
          // ERR PROCEDURE BEGIN
          throw('transcation error BEGIN');
        }).then(res => { 
          // PROCEDURE 2
          if(res.rowCount === 0) {
            return prod2HasPurchased(client, queryObj);
          } else { 
            return prod2NotPurchased(client, queryObj);
          }
        }, err => {
          // ERR PROCEDURE 1
          throw('transcation error 1');
        }).then(res => {
          // PROCEDURE 3
          return prod3AddOrder(client, queryObj, res);
        }, err => {
          // ERR PROCEDURE 2
          throw('transcation error 2');
        }).then(res => {
          // PROCEDURE 4
          return prod4BoxsAndGifts(client, queryObj);
        },err => {
          // ERR PROCEDURE 3
          
          throw('transcation error 3');
        }).then(res => {
          // PROCEDURE COMPLETE
          return prod999Compelete(client, queryObj);
        },err => {
          // ERR PROCEDURE 4
          throw('transcation error 4');
        }).then(res => {
          // **ALL DONE**
          done();
          resolve(true);
        }, err => {
          // ERR PROCEDURE COMPLETE
          throw('transcation error COMPLETE');
        });
      } catch($err) {
        console.log($err);
        prodShouldAbort($err, client, done, reject);
      }
      
    })
  })
}

var prod1GetUserInfo = function(client, queryObj) {
  return proQuery(client, `SELECT m_id FROM mail_member WHERE m_phone = '${queryObj.memberQuery.m_phone}' and m_tw_area_name = '${queryObj.memberQuery.m_tw_area_name}'`);
}
var prod2HasPurchased = function(client, queryObj) {
  /* 更新招牌/地址 */
  const memberQuery = {
    text: `UPDATE mail_member SET m_receive_addr = $1, m_num_plate = $2 WHERE m_phone = $3 and m_tw_area_name = $4 RETURNING m_id`,
    values: [
      queryObj.memberQuery.m_receive_addr,
      queryObj.memberQuery.m_num_plate,
      queryObj.memberQuery.m_phone,
      queryObj.memberQuery.m_tw_area_name
    ]
  }
  return proQuery(client, memberQuery);
}
var prod2NotPurchased = function(client, queryObj) {
  const memberQuery = {
    text: 'INSERT INTO mail_member(m_phone, m_tw_area_name, m_receive_addr, m_num_plate) VALUES ($1, $2, $3, $4) RETURNING m_id',
    values: [
      queryObj.memberQuery.m_phone,
      queryObj.memberQuery.m_tw_area_name,
      queryObj.memberQuery.m_receive_addr,
      queryObj.memberQuery.m_num_plate,
    ]
  }
  return proQuery(client, memberQuery);
}
var prod3AddOrder = function(client, queryObj, res) {
  const orderQuery = {
    text: 'INSERT INTO orders(o_serial_num, o_receivetime, o_paymethod, o_pay_status, o_order_status, totalbalance, totaldeposit, totalgiftprice, m_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING o_id',
    values: [
      queryObj.orderQuery.o_serial_num,
      queryObj.orderQuery.o_receivetime,
      queryObj.orderQuery.o_paymethod,
      queryObj.orderQuery.o_pay_status,
      queryObj.orderQuery.o_order_status,
      queryObj.orderQuery.totalbalance,
      queryObj.orderQuery.totaldeposit,
      queryObj.orderQuery.totalgiftprice,
      res.row[0].m_id
    ],
  }
  return proQuery(client, orderQuery);
}
var prod4BoxsAndGifts = function(client, queryObj) {
  let orderBoxQuery_length = queryObj.orderQuery.orderBoxQuery.length;
  let orderBoxArray1 = [];
  let orderBoxArray2 = [];
  let orderBoxGiftArray1 = [];
  let orderBoxGiftArray2 = [];
  let orderBoxGiftArray3 = [];
  queryObj.orderQuery.orderBoxQuery.forEach(b => {
    orderBoxArray1.push(b.ob_serial_num);
    orderBoxArray2.push(b.b_id);
    b.orderBoxGiftQuery.forEach(g => {
      orderBoxGiftArray1.push(g.b_id);
      orderBoxGiftArray2.push(g.g_id);
      orderBoxGiftArray3.push(g.og_num);
    })
  });
  /** */
  let orderBoxQuery = {
    text: 'INSERT INTO order_box(ob_serial_num, b_id, o_id) VALUES(unnest($1), unnest($2), $3)',
    values: [
      orderBoxArray1,
      orderBoxArray2,
      res.rows[0].o_id,
    ],
  }
  /** */
  let orderBoxGiftQuery = {
    text: 'INSERT INTO order_box_gift(b_id, g_id, og_num) VALUES(unnest($1), unnest($2), unnest($3))',
    values: [
      orderBoxGiftArray1,
      orderBoxGiftArray2,
      orderBoxGiftArray3,
    ],
  }
  return new Promise(async (resolve, reject) => {
    try {
      await proQuery(client, orderBoxQuery);
      await proQuery(client, orderBoxGiftQuery);
      resolve(true);
    } catch($err) {
      console.log('transcation error 4');
      reject(err);
    }

    try {
      await proQuery(client, orderBoxQuery).then(resBoxs => {
        return proQuery(client, orderBoxGiftQuery);
      }, err => {  
        throw('boxs error');
      }).then(resGifts => {
        resolve(true);
      }, err => {
        throw('gifts error');
      })
    } catch($err) {
      console.log('transcation error 4 ('+ $err +')');
      reject($err);
    }
    
  });
  
}
var prod999Compelete = function(client, queryObj) {
  return proQuery(client, 'COMMIT');
}