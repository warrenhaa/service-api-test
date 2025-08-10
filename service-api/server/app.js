// app.js
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import bodyParser from 'body-parser';
import expressWinston from 'express-winston';
import v1router from './v1/routes';
import v2router from './v2/routes';
import GitlabTicketService from './v1/services/GitlabTicketService';
const cors = require('cors');
const winston = require('winston');
const uuid = require('uuid').v4;

const { format } = winston;
require('apminsight')({
  licenseKey: process.env.APMINSIGHT_LICENSE_KEY,
  appName: process.env.APMINSIGHT_APP_NAME,
  port: process.env.APMINSIGHT_APP_PORT,
});

const { UI } = require('bull-board');

const port = process.env.PORT || 3000;
const app = express();


// Log the whole request and response body
expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');

// Logger makes sense before the router
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: false,
      colorize: true,
      format: format.combine(
        format.simple(),
        format.printf((info) => {
          const obj = info;
          if (typeof info === 'object') {
            info = JSON.stringify(info);
            const size = new TextEncoder().encode(info).length;
            const kiloBytes = size / 1024;
            if (obj && obj.meta && obj.meta.req && obj.meta.req.headers) {
              if (obj.meta.req.headers["x-auth-token"]) {
                delete obj.meta.req.headers["x-auth-token"]
              }
              if (obj.meta.req.headers["x-access-token"]) {
                delete obj.meta.req.headers["x-access-token"]
              }
            }
            if (kiloBytes > 265 && obj.meta && obj.meta.res) {
              delete obj.meta.res;
              return JSON.stringify(obj);
            }
            return JSON.stringify(obj);
          }
          return info;
        }),
      ),
    }),
    new (winston.transports.File)({
      filename: './logs/info', level: 'info', json: false, format: format.combine(
        format.simple(),
        format.printf((info) => {
          const obj = info;
          if (typeof info === 'object') {
            info = JSON.stringify(info);
            const size = new TextEncoder().encode(info).length;
            const kiloBytes = size / 1024;
            if (obj && obj.meta && obj.meta.req && obj.meta.req.headers) {
              if (obj.meta.req.headers["x-auth-token"]) {
                delete obj.meta.req.headers["x-auth-token"]
              }
              if (obj.meta.req.headers["x-access-token"]) {
                delete obj.meta.req.headers["x-access-token"]
              }
            }

            return JSON.stringify(obj);
          }
          return info;
        }),
      )
    }),
  ],
}));
// All controllers should live here
app.get('/', (req, res) => {
  res.end('Hello world!');
});
app.use(cors({ exposedHeaders: 'x-auth-token' }));
app.use(cors({ exposedHeaders: 'x-access-token' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token, x-company-code, authorization,x-access-token');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS, PATCH');
  next();
});

app.disable('etag');

app.use('/admin/queues', UI);

app.get('/apidoc.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
});

app.use(async (req, res, next) => {
  req.request_id = uuid();
  const module = req.path.split('/')[3];
  req.serviceModule = module;
  next();
});
app.use(logger('dev'));
app.use(cookieParser());
// Connect API Router - it should be the end of the chain
app.use(express.static(path.join(__dirname, '../public')));
app.get('/version', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    version: "v.0.79.0"
  });
});
app.use('/api/v1', v1router);
app.use('/api/v2', v2router);
app.use(expressWinston.errorLogger({
  transports: [
    new (winston.transports.File)({
      filename: './logs/error', level: 'error', json: false, format: format.combine(
        format.simple(),
        format.printf((info) => {
          const obj = info;
          if (typeof info === 'object') {
            info = JSON.stringify(info);
            const size = new TextEncoder().encode(info).length;
            const kiloBytes = size / 1024;
            if (obj && obj.meta && obj.meta.req && obj.meta.req.headers) {
              if (obj.meta.req.headers["x-auth-token"]) {
                delete obj.meta.req.headers["x-auth-token"]
              }
              if (obj.meta.req.headers["x-access-token"]) {
                delete obj.meta.req.headers["x-access-token"]
              }
            }
            return JSON.stringify(obj);
          }
          return info;
        }),
      )
    }),
    new winston.transports.Console({
      json: true,
      colorize: true,
      format: format.combine(
        format.simple(),
        format.printf(async (info) => {
          const obj = info;
          if (obj.meta?.error?.type == "UleecoServerError") {
            let info = JSON.stringify(obj);
            let data = obj;
            const size = new TextEncoder().encode(info).length;
            const kiloBytes = size / 1024;
            if (kiloBytes > 2) {
              data = obj.meta
            }
            var company_code = obj.meta.req?.headers["x-company-code"] || "-"
            var params = {
            }
            params["search"] = obj.meta.error?.message || "UleecoServerError"
            params["title"] = obj.meta.error?.message || "UleecoServerError"
            params["description"] = '```json' + JSON.stringify(data, null, 2) + '```'
            params["labels"] = [company_code, obj.meta.error?.statusCode.toString(), obj.meta?.error?.responseCode.toString(), obj.meta?.error?.type]
            if (obj.meta.req?.headers.email) {
              delete obj.meta.req?.headers.email;
            }
            const issueExists = await GitlabTicketService.getIssue(params).catch(err => {
              console.log("UleecoServerError", err)
            })
            delete params.search;
            if (issueExists == false) {
              await GitlabTicketService.createIssue(params).catch(err => {
                console.log("UleecoServerError", err)
              })
            }
          }
          if (obj.meta?.error?.type == "UleecoClientError") {
            let info = JSON.stringify(obj);
            let data = obj;
            const size = new TextEncoder().encode(info).length;
            const kiloBytes = size / 1024;
            if (kiloBytes > 2) {
              data = obj.meta
            }
            var company_code = obj.meta.req?.headers["x-company-code"] || "-"
            var params = {
            }
            params["search"] = obj.meta.error?.message || "UleecoClientError"
            params["title"] = obj.meta.error?.message || "UleecoClientError"
            params["description"] = '```json' + JSON.stringify(data, null, 2) + '```'
            params["labels"] = [company_code, obj.meta.error?.statusCode.toString(), obj.meta?.error?.responseCode.toString(), obj.meta?.error?.type]
            if (obj.meta.req?.headers.email) {
              delete obj.meta.req?.headers.email;
            }
            const issueExists = await GitlabTicketService.getClientIssue(params).catch(err => {
              console.log("UleecoServerError", err)
            })
            delete params.search;
            if (issueExists == false) {
              await GitlabTicketService.createClientIssue(params).catch(err => {
                console.log("UleecoClientError", err)
              })
            }
          }
          if (typeof info === 'object') {
            info = JSON.stringify(info);
            const size = new TextEncoder().encode(info).length;
            const kiloBytes = size / 1024;
            if (obj && obj.meta && obj.meta.req && obj.meta.req.headers) {
              if (obj.meta.req.headers["x-auth-token"]) {
                delete obj.meta.req.headers["x-auth-token"]
              }
              if (obj.meta.req.headers["x-access-token"]) {
                delete obj.meta.req.headers["x-access-token"]
              }
            }
            if (kiloBytes > 265 && obj.meta && obj.meta.res) {
              delete obj.meta.res;
              return JSON.stringify(obj);
            }
            return JSON.stringify(obj);
          }
          return info;
        }),
      ),
    }),
  ],
}));


const server = app.listen(port, '', 1000, () => {
  console.info(`Server started on port ${port}`);
});
server.keepAliveTimeout = 310 * 1000;
server.headersTimeout = 315 * 1000;

module.exports = server;
