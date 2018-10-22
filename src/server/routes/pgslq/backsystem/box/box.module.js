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
export const selectVendorBoxList = (v_id) => {
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
      const result = await client.query(`SELECT b_id, b_no, b_size, b_deposit, b_balance, b_img FROM box WHERE v_id = $1`, [v_id]);
      if(result.rowCount === 0) {
        console.log('no box');
        reject('no box');
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

export const selectVendorBox = (b_id) => {
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
      const result = await client.query(`SELECT b_no, b_size, b_stock, b_buymax, b_deposit, b_balance, b_img, giftmax, b_service_country, b_service_area FROM box WHERE b_id = $1`, [b_id]);
      if(result.rowCount === 0) {
        console.log('no such box');
        reject('no such box');
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

export const selectBoxGifts = (b_id) => {
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
      const result = await client.query(`SELECT g_id FROM box_gift WHERE b_id = $1`, [b_id]);
      if(result.rowCount === 0) {
        console.log('no gifts');
        reject('no gifts');
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

export const selectBoxTwarea = (b_id) => {
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
      const result = await client.query(`SELECT area_code FROM box_tw_area WHERE b_id = $1 `, [b_id]);
      if(result.rowCount === 0) {
        console.log('no tw area');
        reject('no tw area');
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
export const createVendorBox = (queryObj) => {
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
      }

      let b_id;
      try {
        const query = {
          text: `INSERT INTO box(v_id, b_no, b_size, b_stock, b_buymax, b_deposit, b_balance, b_img, giftmax, b_service_country, b_service_area) VALUES ($1, $2, $3, $4 ,$5, $6, $7, $8, $9, $10, $11) RETURNING b_id`,
          values: [
            queryObj.vBoxQuery.v_id,
            queryObj.vBoxQuery.b_no,
            queryObj.vBoxQuery.b_size,
            queryObj.vBoxQuery.b_stock,
            queryObj.vBoxQuery.b_buymax,
            queryObj.vBoxQuery.b_deopsit,
            queryObj.vBoxQuery.b_balance,
            queryObj.vBoxQuery.b_img,
            queryObj.vBoxQuery.giftmax,
            queryObj.vBoxQuery.b_service_country,
            queryObj.vBoxQuery.b_service_area,
          ]
        }
        const res = await client.query(query);
        b_id = res.rows[0].b_id;
        console.log('b_id:' + b_id);
      } catch($err) {
        console.log('transcation error 1');
        await prodShouldAbort($err, client, done, reject);
        return;
      }

      let boxGiftArr1 = [];
      queryObj.vBoxGiftQuery.forEach(g => {
        boxGiftArr1.push(g.g_id);
      });

      try {
        const query = {
          text: `INSERT INTO box_gift(g_id, b_id) VALUES(unnest($1::int[]), $2)`,
          values: [
            boxGiftArr1,
            b_id
          ]
        }
        await client.query(query);
      } catch($err) {
        console.log('transcation error 2');
        await prodShouldAbort($err, client, done, reject);
        return;
      }

      let boxTareaArr1 = [];
      queryObj.vBoxTareaQuery.forEach(t => {
        boxTareaArr1.push(t.area_code);
      });


      try {
        const query = {
          text: `INSERT INTO box_tw_area(area_code, b_id) VALUES(unnest($1::varchar[]), $2) `,
          values: [
            boxTareaArr1,
            b_id
          ]
        }
        await client.query(query);
      } catch($err) {
        console.log('transcation error 3');
        await prodShouldAbort($err, client, done, reject);
        return;
      }

      try {
        await client.query('COMMIT');
        console.log('transcation success')
        done();
        resolve('box create success');
      } catch($err) {
        console.log('transcation error COMPLETE');
        await prodShouldAbort($err, client, done, reject);
        return;
      }

    })
  })
}

export const createBoxGift = (b_id, g_id) => {
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
      const result = await client.query('INSERT INTO box_gift(g_id, b_id) VALUES ($1, $2)', [g_id, b_id]);
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

export const createBoxTwarea = (b_id, t_code) => {
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
      const result = await client.query('INSERT INTO box_tw_area(area_code, b_id) VALUES ($1, $2)', [t_code, b_id]);
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
export const updateBox = (queryObj, b_id) => {
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
        text: `UPDATE box
                SET b_no = $1,
                    b_size = $2,
                    b_stock = $3,
                    b_buymax = $4, 
                    b_deposit = $5, 
                    b_balance = $6,
                    b_img = $7,
                    giftmax = $8, 
                    b_service_country = $9,
                    b_service_area = $10
                WHERE b_id = $11`,
        values: [
          queryObj.vBoxQuery.b_no,
          queryObj.vBoxQuery.b_size,
          queryObj.vBoxQuery.b_stock,
          queryObj.vBoxQuery.b_buymax,
          queryObj.vBoxQuery.b_deposit,
          queryObj.vBoxQuery.b_balance,
          queryObj.vBoxQuery.b_img,
          queryObj.vBoxQuery.giftmax,
          queryObj.vBoxQuery.b_service_country,
          queryObj.vBoxQuery.b_service_area,
          b_id,
        ]
      }
      await client.query(query);
      resolve('update success');
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

/* Delete */
export const deleteBox = (b_id) => {
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
      const result = await client.query('DELETE FROM box WHERE b_id = $1', [b_id]);
      if(result.rowCount === 0) {
        console.log('no such box');
        reject('no such box');
      } else {
        resolve('delete success');
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

export const deleteBoxGift = (b_id, g_id) => {
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
      const result = await client.query('DELETE FROM box_gift WHERE b_id = $1 and g_id = $2', [b_id, g_id]);
      if(result.rowCount === 0) {
        console.log('no such gift');
        reject('no such gift');
      } else {
        resolve('delete success');
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

export const deleteBoxTwarea = (b_id, t_code) => {
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
      const result = await client.query('DELETE FROM box_tw_area WHERE b_id = $1 and area_code = $2', [b_id, t_code]);
      if(result.rowCount === 0) {
        console.log('no such tw area');
        reject('no such tw area');
      } else {
        resolve('delete success');
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