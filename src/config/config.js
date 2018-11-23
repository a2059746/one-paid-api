import Joi from 'joi';

require('dotenv').config();

console.log(process.env.PORT)

const envVarSchema = Joi.object().keys({
  NODE_ENV: Joi.string().default('development').allow(['development', 'production']),
  PORT: Joi.number().default(80).allow([8080, 4000, 80]),
  VERSION: Joi.string(),
  MYSQL_PORT: Joi.number().default(3306), //數字且預設值為3306
  MYSQL_HOST: Joi.string().default('127.0.0.1'), //字串取預設值為127.0.0.1
  MYSQL_USER: Joi.string(), // 字串
  MYSQL_PASS: Joi.string(), // 字串
  MYSQL_NAME: Joi.string(), // 字串
}).unknown().required();

const {error, value:envVars} = Joi.validate(process.env, envVarSchema)

console.log(envVars.PORT)

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

/**
 * JPK
 * C018110616000001
 * 14b21bf3872847fab751e1846606da23
 * ---
 * GOWINT
 * C018091320000001
 * 9184c6821c5b4713937d26a305fd1353
 */
export const config = {
  version: envVars.VERSION,
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  secCode: '14b21bf3872847fab751e1846606da23',
  MerID: 'C018110616000001',
}

export const myConfig = {
  mysqlPort: envVars.MYSQL_PORT, // 連接阜號(MYSQL_PORT)
  mysqlHost: envVars.MYSQL_HOST, // 主機名稱 (MYSQL_HOST)
  mysqlUserName: envVars.MYSQL_USER, // 用戶名稱 (MYSQL_USER)
  mysqlPass: envVars.MYSQL_PASS, // 資料庫密碼(MYSQL_PASS)
  mysqlDatabase: envVars.MYSQL_DATABASE // 資料庫名稱(MYSQL_DATABASE)
};

export const pgConfig = {
  pgPort: envVars.PG_PORT, // 連接阜號(PG_PORT)
  pgHost: envVars.PG_HOST, // 主機名稱 (PG_HOST)
  pgUserName: envVars.PG_USER, // 用戶名稱 (PG_USER)
  pgPass: envVars.PG_PASS, // 資料庫密碼(PG_PASS)
  pgDatabase: envVars.PG_DATABASE // 資料庫名稱(PG_DATABASE)
}
