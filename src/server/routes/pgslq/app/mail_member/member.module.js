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
export const selectReceiveAddr = (phone, tw_area) => {
  return new Promise( async (resolve, reject) => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`SELECT m_receive_addr FROM mail_member WHERE m_phone = '${phone}' and m_tw_area_name = '${tw_area}';`);
        if(result.rowCount === 0) {
          resolve(null); 
        } else if(result.rowCount === 1) {
          resolve(result.rows[0]);
        }
      } catch(err) {
        console.log('querry error');
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