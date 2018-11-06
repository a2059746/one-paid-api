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
export const selectBoxGifts = (b_id) => {
  return new Promise( async (resolve, reject) => {
    try {
      const client = await pool.connect();
      try {
        const {rows} = await client.query(`SELECT gift.g_id, g_name, g_img, g_price FROM box_gift, gift WHERE box_gift.b_id = ${b_id} and box_gift.g_id = gift.g_id;`);
        resolve(rows);
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
