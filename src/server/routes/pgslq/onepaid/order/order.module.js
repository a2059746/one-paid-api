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

/* Post */
export const createOnePaidOrder = (queryObj, oid) => {
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
      const customeArgs = JSON.parse(queryObj.CustomeArgs);

      const query = {
        text: `INSERT INTO op_orders(op_stc, op_m, op_mid, op_mtn, op_tn, op_pd, op_pwt, op_pmt, op_pn, op_ct, op_ta, op_r, op_sic, op_bd1, op_bd2, op_bd3, op_pdl, op_strn, op_cvs, o_id)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        values: [
          queryObj.StatusCode,
          queryObj.Message,
          queryObj.MerID,
          queryObj.MerTradeNo,
          queryObj.TradeNo,
          queryObj.PaymentDate,
          queryObj.PaywayType,
          queryObj.PaymentType,
          queryObj.ProductName,
          queryObj.CurrencyType,
          queryObj.TotalAmt,
          queryObj.Remark,
          queryObj.SignCode,
          customeArgs.Barcode1,
          customeArgs.Barcode2,
          customeArgs.Barcode3,
          customeArgs.PayDeadline,
          customeArgs.StoreName,
          customeArgs.CVSCode,
          oid
        ]
      }
      const result = await client.query(query);
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