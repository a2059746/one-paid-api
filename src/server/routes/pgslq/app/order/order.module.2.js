import {Pool} from 'pg';
import {pgConfig} from '../../../../../config/config';

const pool = new Pool({
  host: pgConfig.pgHost,
  user: pgConfig.pgUserName,
  password: pgConfig.pgPass,
  database: pgConfig.pgDatabase,
  post: pgConfig.pgPort,
  ssl: true
});


const prodShouldAbort = async (err, client, done, reject) => {
  console.log('Error in transaction', err.stack)
  try {
    console.log(err);
    const res = await proQuery(client, 'ROLLBACK');
    console.log('Success rolling back client', res);
  } catch($err) {
    console.log('Error rolling back client', $err.stack);
  }
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

/* Get */
export const selectVendorOnePadiInfo = (v_id) => {
  return new Promise( async (resolve, reject) => {
    try {
      const client = await pool.connect();
      try {
        const {rows} = await client.query(`SELECT op_merid, op_scode, o_count FROM vendor WHERE v_id = $1`, [v_id]);
        resolve(rows[0]);
      } catch(err) {
        console.log('query error');
        console.log(err);
        reject(err);
      }
    } catch(err) {
      console.log('connect error');
      console.log(err);
      reject(err);
    }
  })
}

/* Post */
export const createOrderTranscations = (queryObj) => {
  console.log(queryObj)
  return new Promise((resolve, reject) => {
    pool.connect( async (error, client, done) => {
      if(error) {
        done();
        console.log(error)
        return reject(error);
      }
      try {
        await proQuery(client, 'BEGIN');
      } catch($err) {
        console.log('transcation error BEGIN');
        prodShouldAbort($err, client, done, reject);
        return;
      }

      let prod1Res;
      try {
        prod1Res = await prod1GetUserInfo(client, queryObj);
      } catch($err) {
        console.log('transcation error 1');
        prodShouldAbort($err, client, done, reject);
        return;
      }

      let prod2Res;
      try {
        if(prod1Res.rowCount === 0) {
          prod2Res = await prod2NotPurchased(client, queryObj);
        } else { 
          prod2Res = await prod2HasPurchased(client, queryObj);
        }
      } catch($err) {
        console.log('transcation error 2');
        prodShouldAbort($err, client, done, reject);
        return;
      }

      let prod3Res;
      try {
        prod3Res = await prod3AddOrder(client, queryObj, prod2Res);
      } catch($err) {
        console.log('transcation error 3');
        prodShouldAbort($err, client, done, reject);
        return;
      }

      try {
        await prod4BoxsAndGifts(client, queryObj, prod3Res);
      } catch($err) {
        console.log('transcation error 4');
        prodShouldAbort($err, client, done, reject);
        return;
      }

      try {
        await prod5UpdateOrderCount(client, queryObj);
      } catch($err) {
        console.log('transcation error 5');
        prodShouldAbort($err, client, done, reject);
        return;
      }

      try {
        await prod999Compelete(client);
        console.log('transcation success')
        done();
        resolve(prod3Res.rows[0].o_id);
      } catch($err) {
        console.log('transcation error COMPLETE');
        prodShouldAbort($err, client, done, reject);
        return;
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
    text: `UPDATE mail_member SET m_name = $1, m_receive_addr = $2, m_num_plate = $3 WHERE m_phone = $4 and m_tw_area_name = $5 RETURNING m_id`,
    values: [
      queryObj.memberQuery.m_name,
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
    text: 'INSERT INTO mail_member(m_phone, m_name, m_tw_area_name, m_receive_addr, m_num_plate) VALUES ($1, $2, $3, $4, $5) RETURNING m_id',
    values: [
      queryObj.memberQuery.m_phone,
      queryObj.memberQuery.m_name,
      queryObj.memberQuery.m_tw_area_name,
      queryObj.memberQuery.m_receive_addr,
      queryObj.memberQuery.m_num_plate,
    ]
  }
  return proQuery(client, memberQuery);
}
var prod3AddOrder = function(client, queryObj, res) {
  const orderQuery = {
    text: 'INSERT INTO orders(o_serial_num, o_receivetime, o_paymethod, o_pay_status, o_order_status, o_receive_addr, o_num_plate, totalbalance, totaldeposit, totalgiftprice, v_id, m_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING o_id',
    values: [
      queryObj.orderQuery.o_serial_num,
      queryObj.orderQuery.o_receivetime,
      queryObj.orderQuery.o_paymethod,
      queryObj.orderQuery.o_pay_status,
      queryObj.orderQuery.o_order_status,
      queryObj.orderQuery.o_receive_addr,
      queryObj.orderQuery.o_num_plate,
      queryObj.orderQuery.totalbalance,
      queryObj.orderQuery.totaldeposit,
      queryObj.orderQuery.totalgiftprice,
      queryObj.orderQuery.v_id,
      res.rows[0].m_id
    ],
  }
  return proQuery(client, orderQuery);
}
var prod4BoxsAndGifts = function(client, queryObj, res) {
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
    text: 'INSERT INTO order_box(ob_serial_num, b_id, o_id) VALUES(unnest($1::VARCHAR[]), unnest($2::INTEGER[]), $3)',
    values: [
      orderBoxArray1,
      orderBoxArray2,
      res.rows[0].o_id,
    ],
  }
  /** */
  let orderBoxGiftQuery = {
    text: 'INSERT INTO order_gift(b_id, g_id, og_num, o_id) VALUES(unnest($1::INTEGER[]), unnest($2::INTEGER[]), unnest($3::INTEGER[]), $4)',
    values: [
      orderBoxGiftArray1,
      orderBoxGiftArray2,
      orderBoxGiftArray3,
      res.rows[0].o_id,
    ],
  }
  return new Promise(async (resolve, reject) => {
    try {
      await proQuery(client, orderBoxQuery);
    } catch($err) {
      console.log('transcation error boxes');
      reject($err);
    }

    try {
      await proQuery(client, orderBoxGiftQuery);
      resolve(true);
    } catch($err) {
      console.log('transcation error gifts');
      reject($err);
    }
    
  });
  
}

var prod5UpdateOrderCount = function(client, queryObj) {
  const orderQuery = {
    text: `UPDATE vendor 
            SET o_count = o_count + 1
            WHERE v_id = $1`,
    values: [queryObj.orderQuery.v_id]
  }
  return proQuery(client, orderQuery);
}

var prod999Compelete = function(client) {
  return proQuery(client, 'COMMIT');
}