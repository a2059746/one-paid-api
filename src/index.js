// const http = require('http');

// const server = http.createServer((requestAnimationFrame, res) => {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.end('Hello World !')
// })

// server.listen('3000', () => {
//     console.log('server is listening on port 3000 !');
// })

import {config} from './config/config';
import app from './config/express';

if (!module.parent) {
 // listen on port config.port
 app.listen(config.port, () => {
   console.log(`server started on  port http://127.0.0.1:${config.port} (${config.env})`);
 });
}

export default app;