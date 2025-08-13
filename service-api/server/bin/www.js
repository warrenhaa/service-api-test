/* eslint-disable no-use-before-define */
/* eslint-disable no-restricted-globals */
/**
 * Module dependencies.
 */

import debugLib from 'debug';
import http from 'http';
import app from '../app';

const debug = debugLib('service-api:server');

/**
 * Get port from environment and store in Express.
 */

// eslint-disable-next-line no-use-before-define
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      //process.exit(1);
      console.info("process.exit start:"+error.code)
      break;
    case 'EADDRINUSE':
      //process.exit(1);
      console.info("process.exit start:"+error.code)
      break;
      console.info(error.code)
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}
