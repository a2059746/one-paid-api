import mysql from 'mysql';
import config from '../../../config/config';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});

/*  Post */
const createTest = (insertValue) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if(connectionError) {
        reject(connectionError);
      } else {
        connection.query('INSERT INTO test SET ?', insertValue, (error, result) => {
          if(error) {
            console.log('SQL error : ' + error);
            reject(error);
          } else if (result.affectedRows === 1){
            console.log(result);
            resolve(`新增成功！ article_id: ${result.insertId}`);
          }
          connection.release();
        })
      }
    })
  })
}

/* Get */
const selectAllTest = () => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if(connectionError) {
        reject(connectionError);
      } else {
        connection.query('SELECT * FROM test', (error, result) => {
          if(error) {
            reject(error);
          } else {
            console.log(result);
            resolve(result);
          }
          connection.release();
        })
      }
    })
  })
}

/* PUT */
const updateTest = (updateValues, testName) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if(connectionError) {
        reject(connectionError);
      } else {
        connection.query('UPDATE test SET ? WHERE test_name = ?', [updateValues, testName], (error, result) => {
          if(error) { // 寫入資料庫有問題時回傳錯誤
            reject(error);
          } else if(result.affectedRows === 0 ) { // 寫入時發現無該筆資料
            console.log(result);
            resolve('查無此人');
          } else if(result.message.match('Changed: 1')) { // 寫入成功
            console.log(result);
            resolve('資料修改成功');
          } else {
            console.log(result);
            resolve('資料無異動');
          }
          connection.release();
        })
      }
    })
  })
}

/* Delete */
const deleteTest = (testName) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if(connectionError) {
        reject(connectionError);
      } else {
        connection.query('DELETE FROM test WHERE test_name = ?', testName, (error, result) => {
          if(error) {
            resolve(error);
          } else if(result.affectedRows === 1) {
            console.log(result);
            resolve('刪除成功！');
          } else if(result.affectedRows === 0){
            console.log(result);
            resolve('查無此人！')
          } else {
            console.log(result);
            resolve('刪除失敗！')
          }
          connection.release();
        })
      }
    })
  })
}

export default {
  createTest,
  selectAllTest,
  updateTest,
  deleteTest,
};