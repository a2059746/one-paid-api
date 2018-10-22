import {Pool} from 'pg';
import {pgConfig} from '../../../../config/config';

const pool = new Pool({
  host: pgConfig.pgHost,
  user: pgConfig.pgUserName,
  password: pgConfig.pgPass,
  database: pgConfig.pgDatabase,
  post: pgConfig.pgPort,
  ssl: true
});


const shouldAbort = (err, client) => {
  if (err) {
    console.error('Error in transaction', err.stack)
    client.query('ROLLBACK', (err) => {
      if (err) {
        console.error('Error rolling back client', err.stack)
      }
      // release the client back to the pool
      done()
    })
  }
  return !!err
}

/* Post */
export const createOrderTranscations = (queryObj) => {
  console.log(queryObj)
  return new Promise( async (resolve, reject) => {
    pool.connect((err, client, done) => {

      client.query('BEGIN', (err) => {
        if(shouldAbort(err, client)) {
          console.log('transcation error');
          reject(err);
        }

        client.query(`SELECT m_id FROM mail_member WHERE m_phone = '${queryObj.memberQuery.m_phone}' and m_tw_area_name = '${queryObj.memberQuery.m_tw_area_name}'`, (err, res) => {
          if(shouldAbort(err, client)) {
            console.log('transcation error 1');
            reject(err);
          }

          var m_id;

          if(res.rowCount === 0) {
            const memberQuery = {
              text: 'INSERT INTO mail_member(m_phone, m_tw_area_name, m_receive_addr, m_num_plate) VALUES ($1, $2, $3, $4) RETURNING m_id',
              values: [
                queryObj.memberQuery.m_phone,
                queryObj.memberQuery.m_tw_area_name,
                queryObj.memberQuery.m_receive_addr,
                queryObj.memberQuery.m_num_plate,
              ]
            }
            client.query(memberQuery, (err, res) => {
              if(shouldAbort(err, client)) {
                console.log('transcation error 2');
                reject(err);
              }
              m_id = res.rows[0].m_id;
              console.log('mid:' + m_id)

              const orderQuery = {
                text: 'INSERT INTO orders(o_serial_num, o_receivetime, o_paymethod, o_pay_status, o_order_status, totalbalance, totaldeposit, totalgiftprice, m_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING o_id',
                values: [
                  queryObj.orderQuery.o_serial_num,
                  queryObj.orderQuery.o_receivetime,
                  queryObj.orderQuery.o_paymethod,
                  queryObj.orderQuery.o_pay_status,
                  queryObj.orderQuery.o_order_status,
                  queryObj.orderQuery.totalbalance,
                  queryObj.orderQuery.totaldeposit,
                  queryObj.orderQuery.totalgiftprice,
                  m_id
                ],
              }
              client.query(orderQuery, (err, res) => {
                if(shouldAbort(err, client)) {
                  console.log('transcation error 3');
                  reject(err);
                }
    
                let orderBoxQuery_length = queryObj.orderQuery.orderBoxQuery.length;
                for(let idx = 0; idx < orderBoxQuery_length; idx++) {
    
                  let orderBoxQuery = {
                    text: 'INSERT INTO order_box(ob_serial_num, b_id, o_id) VALUES($1, $2, $3)',
                    values: [
                      queryObj.orderQuery.orderBoxQuery[idx].ob_serial_num,
                      queryObj.orderQuery.orderBoxQuery[idx].b_id,
                      res.rows[0].o_id,
                    ],
                  }
                  
                  let orderBoxAmount = queryObj.orderQuery.orderBoxQuery[idx].boxAmount;
                  for(let ob_idx = 0; ob_idx < orderBoxAmount; ob_idx++){
                    client.query(orderBoxQuery, (err, res) => {
                      if(shouldAbort(err, client)) {
                        console.log('transcation error 4');
                        reject(err);
                      }
                    })
                  }
                 
                  let orderBoxGiftQuery_length = queryObj.orderQuery.orderBoxQuery[idx].orderBoxGiftQuery.length;
                  for(let index = 0; index < orderBoxGiftQuery_length; index++) {
    
                    let orderBoxGiftQuery = {
                      text: 'INSERT INTO order_box_gift(b_id, g_id, og_num) VALUES($1, $2, $3)',
                      values: [
                        queryObj.orderQuery.orderBoxQuery[idx].orderBoxGiftQuery[index].b_id,
                        queryObj.orderQuery.orderBoxQuery[idx].orderBoxGiftQuery[index].g_id,
                        queryObj.orderQuery.orderBoxQuery[idx].orderBoxGiftQuery[index].og_num,
                      ],
                    }
                    client.query(orderBoxGiftQuery, (err,res) => {
                      if(shouldAbort(err, client)) {
                        console.log('transcation error 5');
                        reject(err);
                      } 
                    })   
                  }

                }

                client.query('COMMIT', (err) => {
                  if (err) {
                    console.error('Error committing transaction', err.stack);
                  }
                  done();
                  resolve('Order established successfully');
                })

              })



            })
          } else { 
            /* 更新招牌/地址 */ 
            m_id = res.rows[0]['m_id']; 
          
            const orderQuery = {
              text: 'INSERT INTO orders(o_serial_num, o_receivetime, o_paymethod, o_pay_status, o_order_status, totalbalance, totaldeposit, totalgiftprice, m_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING o_id',
              values: [
                queryObj.orderQuery.o_serial_num,
                queryObj.orderQuery.o_receivetime,
                queryObj.orderQuery.o_paymethod,
                queryObj.orderQuery.o_pay_status,
                queryObj.orderQuery.o_order_status,
                queryObj.orderQuery.totalbalance,
                queryObj.orderQuery.totaldeposit,
                queryObj.orderQuery.totalgiftprice,
                m_id
              ],
            }
            client.query(orderQuery, (err, res) => {
              if(shouldAbort(err, client)) {
                console.log('transcation error 3');
                reject(err);
              }
  
              let orderBoxQuery_length = queryObj.orderQuery.orderBoxQuery.length;
              for(let idx = 0; idx < orderBoxQuery_length; idx++) {
  
                let orderBoxQuery = {
                  text: 'INSERT INTO order_box(ob_serial_num, b_id, o_id) VALUES($1, $2, $3)',
                  values: [
                    queryObj.orderQuery.orderBoxQuery[idx].ob_serial_num,
                    queryObj.orderQuery.orderBoxQuery[idx].b_id,
                    res.rows[0].o_id,
                  ],
                }
                
                let orderBoxAmount = queryObj.orderQuery.orderBoxQuery[idx].boxAmount;
                for(let ob_idx = 0; ob_idx < orderBoxAmount; ob_idx++){
                  client.query(orderBoxQuery, (err, res) => {
                    if(shouldAbort(err, client)) {
                      console.log('transcation error 4');
                      reject(err);
                    }
                  })
                }
               
                let orderBoxGiftQuery_length = queryObj.orderQuery.orderBoxQuery[idx].orderBoxGiftQuery.length;
                for(let index = 0; index < orderBoxGiftQuery_length; index++) {
  
                  let orderBoxGiftQuery = {
                    text: 'INSERT INTO order_box_gift(b_id, g_id, og_num) VALUES($1, $2, $3)',
                    values: [
                      queryObj.orderQuery.orderBoxQuery[idx].orderBoxGiftQuery[index].b_id,
                      queryObj.orderQuery.orderBoxQuery[idx].orderBoxGiftQuery[index].g_id,
                      queryObj.orderQuery.orderBoxQuery[idx].orderBoxGiftQuery[index].og_num,
                    ],
                  }
                  client.query(orderBoxGiftQuery, (err,res) => {
                    if(shouldAbort(err, client)) {
                      console.log('transcation error 5');
                      reject(err);
                    } 
    
                    client.query('COMMIT', (err) => {
                      if (err) {
                        console.error('Error committing transaction', err.stack);
                      }
                      done();
                      resolve('Order established successfully');
                    })
    
                  })
                }
              }
            })

          }

        })

      })

    })
  })
}