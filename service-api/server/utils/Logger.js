const winston = require('winston');

const debug = winston.createLogger({
  levels: {
    debug: 0,
  },
  transports: [
    new (winston.transports.File)({ filename: './logs/debug', level: 'debug' }),
    new (winston.transports.Console)({ level: 'debug' }),
  ],
});

const info = winston.createLogger({
  levels: {
    info: 1,
  },
  transports: [
    new (winston.transports.File)({ filename: './logs/info', level: 'info' }),
    new (winston.transports.Console)({ level: 'info' }),
  ],
});

const warn = winston.createLogger({
  levels: {
    warn: 2,
  },
  transports: [
    new (winston.transports.File)({ filename: './logs/warn', level: 'warn' }),
    new (winston.transports.Console)({ level: 'warn' }),
  ],
});

const error = winston.createLogger({
  levels: {
    error: 3,
  },
  transports: [
    new (winston.transports.File)({ filename: './logs/error', level: 'error' }),
    new (winston.transports.Console)({ level: 'error' }),
  ],
});

const exports = {
  debug(msg, log) {
    debug.debug(msg, log);
  },
  info(msg, log) {
    info.info(msg, log);
  },
  warn(msg, log) {
    warn.warn(msg, log);
  },
  error(msg, log) {
    error.error(msg, log);
  },
  log(level, msg, logmessage) {
    const lvl = exports[level];
    lvl(msg, logmessage);
  },
};

module.exports = exports;
