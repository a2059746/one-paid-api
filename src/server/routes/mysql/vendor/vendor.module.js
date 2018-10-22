import mysql from 'mysql';
import {config} from '../../../config/config';

const connectionPool = mysql.createPool({
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase,
})

/* Get */
const selectAllVendors = () => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if(connectionError) {
        reject(connectionError);
      } else {
        connection.query('SELECT v_name, v_subname, v_logo, v_cover FROM vendor', (error, result) => {
          if(error) {
            reject(error);
          } else {
            resolve(result);
          }
          connection.release();
        })
      }
    })
  })
}



export default {
  selectAllVendors,
}