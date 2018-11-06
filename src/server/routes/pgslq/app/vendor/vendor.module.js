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
const selectAllVendors = () => {
  return new Promise((resolve, reject) => {
    (async () => {
      const client = await pool.connect();
      try {
        const {rows} = await client.query(`SELECT * FROM vendor;`);
        resolve(rows);
      } catch(err) {
        console.log(err);
        reject(err);
      } finally {
        console.log('release');
        client.release();
      }
    })().catch(e => console.log(e.stack))
  })
}

const selectVendorIntro = (v_id, language) => {
  return new Promise( async (resolve, reject) => {
    try {
      const client = await pool.connect();
      try {
        const query = {
          text: `SELECT vi_intro FROM vendor_intro WHERE v_id = $1 and vi_language = $2;`,
          values: [v_id, language]
        };
        const {rows} = await client.query(query);
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

const selectVendorBoxes = (v_id, tw_area_name) => {
  return new Promise( async (resolve, reject) => {
    try {
      const client = await pool.connect();
      try {
        const query = {
          text: 'SELECT * FROM box, box_tw_area, tw_area WHERE box.b_id = box_tw_area.b_id and box_tw_area.area_code = tw_area.area_code and box.v_id = $1 and tw_area.area_name = $2',
          values: [v_id, tw_area_name]
        }
        const {rows} = await client.query(query);
        console.log(rows);
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

export default {
  selectAllVendors,
  selectVendorIntro,
  selectVendorBoxes,
};