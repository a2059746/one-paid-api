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
export const selectVendorGiftList = (v_id) => {
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
      const result = await client.query(`SELECT g_id, g_name, g_stock, g_img, g_price FROM gift WHERE v_id = $1`, [v_id]);
      if(result.rowCount === 0) {
        console.log('no gift');
        reject('no gift');
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

/* Post */
export const createVendorGift = (queryObj) => {
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
        text: `INSERT INTO gift(v_id, g_name, g_stock, g_img, g_price) VALUES ($1, $2, $3, $4, $5)`,
        values: [
          queryObj.vGiftQuery.v_id,
          queryObj.vGiftQuery.g_name,
          queryObj.vGiftQuery.g_stock,
          queryObj.vGiftQuery.g_img,
          queryObj.vGiftQuery.g_price
        ]
      }
      await client.query(query);
      resolve('create success');
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

/* Put */
export const updateGift = (queryObj, g_id) => {
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
        text: `UPDATE gift
                SET g_name = $1, 
                    g_stock = $2, 
                    g_img = $3, 
                    g_price = $4
                WHERE g_id = $5`,
        values: [
          queryObj.vGiftQuery.g_name,
          queryObj.vGiftQuery.g_stock,
          queryObj.vGiftQuery.g_img,
          queryObj.vGiftQuery.g_price,
          g_id
        ]
      }
      const result = await client.query(query);
      console.log(result);
      if(result.rowCount === 0) {
        reject('no such gift');
      } else {
        resolve('update success');
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

/* Post */
export const deleteGift = (g_id) => {
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
      const result = await client.query(`DELETE FROM gift WHERE g_id = $1`, [g_id]);
      resolve('delete success');
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