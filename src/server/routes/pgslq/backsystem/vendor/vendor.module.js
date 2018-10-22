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
export const selectVendorInfo = (v_key) => {
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
      const result = await client.query(`SELECT * FROM vendor WHERE v_key = $1::varchar`, [v_key]);
      if(result.rowCount === 0) {
        console.log('no such vendor');
        reject('no such vendor');
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

export const selectVendorIntroAndBulletin = (v_id) => {
  return new Promise( async (resolve, reject) => {
    pool.connect((error, client, done) => {
      if(error) {
        done();
        console.log('connect error');
        console.log(error);
        reject(error);
        return;
      }

      let result = {};

      proQuery(client, 'BEGIN').then(res => {
        return proQuery(client, `SELECT * FROM vendor_intro WHERE v_id = ${v_id}`);
      }, err => {
        console.log('transcation error BEGIN');
        throw(err);
      }).then(res => {
        console.log(res);
        result.vIntro = res.rows;
        return proQuery(client, `SELECT * FROM vendor_bulletin WHERE v_id = ${v_id}`)
      }, err => {
        throw(err);
      }).then(res => {
        console.log(res);
        result.vBulletin = res.rows;
        done();
        resolve(result);
      }, err => {
        throw(err);
      }).catch(($err) => {
        prodShouldAbort($err, client, done, reject);
      })
    })
  })
}


/* Post */
var createVendorInfo = function (client, queryObj){
  const query = {
    text: 'INSERT INTO vendor(v_key, v_name, v_subname, op_merid, op_scode, v_mail, v_website, v_phone, v_fax, v_addr) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING v_id',
    values: [
      queryObj.vInfoQuery.v_key, 
      queryObj.vInfoQuery.v_name,
      queryObj.vInfoQuery.v_subname,
      queryObj.vInfoQuery.op_merid, 
      queryObj.vInfoQuery.op_scode,
      queryObj.vInfoQuery.v_mail, 
      queryObj.vInfoQuery.v_website, 
      queryObj.vInfoQuery.v_phone,
      queryObj.vInfoQuery.v_fax, 
      queryObj.vInfoQuery.v_addr,
    ]
  }
  return proQuery(client, query);  
}

export const createVendor = (queryObj) => {
  return new Promise( async (resolve, reject) => {
    pool.connect((error, client, done) => {
      if(error) {
        done();
        console.log('connect error');
        console.log(error);
        reject(error);
        return;
      }

      console.log(queryObj);
      let v_id;
      proQuery(client, 'BEGIN').then(res => {
        return createVendorInfo(client, queryObj);
      }, err => {
        console.log('transcation error BEGIN');
        throw(err);
      }).then(res => {
        v_id = res.rows[0].v_id;
        const query = {
          text: `INSERT INTO vendor_intro(vi_language, vi_intro, v_id) VALUES (unnest($1::varchar[]), unnest($2::varchar[]), $3)`,
          values: [
            ['Chinese', 'Philippines', 'Vietnam', 'Indonesia', 'Thailand', 'Myanmar'],
            [null, null, null, null, null, null],
            v_id,
          ]
        }
        return proQuery(client, query);
      }, err => {
        console.log('transcation error CREATE VENDOR INFO');
        throw(err);
      }).then(res => {
        const query = {
          text: `INSERT INTO vendor_bulletin(vb_language, vb_bulletin, v_id) VALUES (unnest($1::varchar[]), unnest($2::varchar[]), $3)`,
          values: [
            ['Chinese', 'Philippines', 'Vietnam', 'Indonesia', 'Thailand', 'Myanmar'],
            [null, null, null, null, null, null],
            v_id,
          ]
        }
        return proQuery(client, query);
      }, err => {
        console.log('transcation error CREATE VENDOR INTRO');
        throw(err);
      }).then(res => {
        return proQuery(client, 'COMMIT');
      }, err => {
        console.log('transcation error CREATE VENDOR BULLEITN');
        throw(err);
      }).then(res => {
        done();
        resolve(v_id);
      }, err => {
        console.log('transcation error COMMIT');
        throw(err);
      }).catch(($err) => {
        prodShouldAbort($err, client, done, reject);
      })

    })
  })
}

/* Put */
export const updateVendorInfo = (queryObj, v_id) => {
  return new Promise( async (resolve, reject) => {
    let client;
    try {
      client = await pool.connect();
    } catch(err) {
      console.log('connect error');
      console.log(err);
      return reject(err);
    }

    try {
      const query = {
        text: `UPDATE vendor
                SET v_name = $1, v_subname = $2, v_storecode = $3, v_bankcode = $4, v_mail = $5, v_website = $6, v_phone = $7, v_fax = $8, v_addr = $9
                WHERE v_id = ${v_id}`,
        values: [
          queryObj.vInfoQuery.v_name,
          queryObj.vInfoQuery.v_subname,
          queryObj.vInfoQuery.v_storecode,
          queryObj.vInfoQuery.v_bankcode,
          queryObj.vInfoQuery.v_mail,
          queryObj.vInfoQuery.v_website,
          queryObj.vInfoQuery.v_phone,
          queryObj.vInfoQuery.v_fax,
          queryObj.vInfoQuery.v_addr,
        ]
      }
      const result = await proQuery(client, query);
      console.log(result);
      if(result.rowCount === 0) {
        reject('no such record');
      } else if (result.rowCount === 1) {
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

export const updateVendorIntroAndBulletin = (queryObj, v_id) => {
  return new Promise( async (resolve, reject) => {
    pool.connect((error, client, done) => {
      if(error) {
        done();
        console.log('connect error');
        console.log(error);
        reject(error);
        return;
      }
      console.log(queryObj);
      let introValue1 = [];
      let introValue2 = [];
      let bulletinValue1 = [];
      let belletinValue2 = [];
      queryObj.vIntroQuery.forEach(i => {
        introValue1.push(i.vi_intro);
        introValue2.push(i.vi_language);
      });
      queryObj.vBulletinQuery.forEach(b => {
        bulletinValue1.push(b.vb_intro);
        belletinValue2.push(b.vb_language);
      });

      proQuery(client, 'BEGIN').then(res => {
        const query = {
          text: `UPDATE vendor_intro 
                  SET vi_intro = unnest($1::varchar[])
                  WHERE vi_language = unnest($2::varchar[]) and v_id = $3`,
          values: [
            introValue1,
            introValue2,
            v_id
          ]
        }
        return proQuery(client, query);
      }, err => {
        throw(err);
      }).then(res => {
        const query = {
          text: `UPDATE vendor_bulletin 
                  SET vb_intro = unnest($1::varchar[])
                  WHERE vb_language = unnest($2::varchar[]) and v_id = $3`,
          values: [
            bulletinValue1,
            belletinValue2,
            v_id
          ]
        }
        return proQuery(client, query);
      }, err => {
        throw(err);
      }).then(res => {
        done();
        resolve('update success');
      }, err => {
        throw(err);
      }).catch(($err) => {
        prodShouldAbort($err, client, done, reject);
      })

    })
  })
}