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

/* Get */
export const selectCustomerOrderRecord = (m_phone) => {
  return new Promise( async (resolve, reject) => {
    let client;
    try {
      client = await pool.connect();
    } catch(err) {
      console.log('connect error');
      console.log(err);
      return reject(err); // if no retrun, the program will still run
    }
    
    try {
      const query = {
        text: `SELECT o.o_id,  o.o_timestamp, o.o_paymethod, ps.sl_text as ps_text, ps.sl_color as ps_color, os.sl_text as os_text, os.sl_color as os_color
                FROM  "mail_member" m, "orders" o
                  LEFT JOIN status_list as ps ON o.o_pay_status = ps.sl_code
                  LEFT JOIN status_list as os ON o.o_order_status = os.sl_code
                WHERE o.m_id = m.m_id and m.m_phone = $1 ORDER BY o.o_id DESC`,
        values: [m_phone]
      }
      const result = await client.query(query);
      if(result.rowCount === 0) {
        console.log('no such record');
        reject('no such record');
      } else {
        resolve(result.rows);
      }
    } catch(err) {
      console.log('query error');
      console.log(err);
      reject(err);
    } finally {
      console.log('release');
      client.release();
      return;
    }
  })
}

export const selectRecordInfo = (o_id) => {
  return new Promise( async (resolve, reject) => {
    let client;
    try {
      client = await pool.connect();
    } catch(err) {
      console.log('connect error');
      console.log(err);
      return reject(err); // if no retrun, the program will still run
    }
    
    try {
      const query = {
        text: `SELECT o.*, m.m_name, ps.sl_text as ps_text, ps.sl_color as ps_color, os.sl_text as os_text, os.sl_color as os_color
                FROM  "mail_member" m, "orders" o
                  LEFT JOIN status_list as ps ON o.o_pay_status = ps.sl_code
                  LEFT JOIN status_list as os ON o.o_order_status = os.sl_code
                WHERE o.m_id = m.m_id and o.o_id = $1`,
        values: [o_id]
      }
      const result = await client.query(query);
      if(result.rowCount === 0) {
        console.log('no such record');
        reject('no such record');
      } else {
        resolve(result.rows[0]);
      }
    } catch(err) {
      console.log('query error');
      console.log(err);
      reject(err);
    } finally {
      console.log('release');
      client.release();
      return;
    }
  })
}

