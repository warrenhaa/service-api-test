import LogGenerator from './LogGenerator';
import Logger from './Logger';

export default class Util {
  constructor() {
    this.statusCode = null;
    this.type = null;
    this.data = null;
    this.stack = null;
    this.message = null;
  }

  setSuccess(statusCode, data) {
    this.statusCode = statusCode;
    this.data = data;
    this.type = 'success';
  }

  setError(statusCode) {
    this.statusCode = statusCode;
    this.type = 'error';
  }

  setMessage(message) {
    this.message = message;
    this.type = 'error';
  }

  createResponse() {
    const result = {
      status: this.type,
      data: this.data,
    };
    return result;
  }

  sendError(req, res, error) {
    const { request_id } = req;
    const code = error.statusCode || 500;
    const type = error.type || "UleecoServerError";
    const responceObj = { request_id, code, message: error.message, type };
    if (error.responseCode == '440000') {
      delete error.stack;
    }
    if (error.responseCode) {
      res.setHeader('x-response-code', error.responseCode);
      responceObj.response_code = error.responseCode;
    }
    return res.status(code).send(responceObj);
  }

  send(req, res) {
    const result = {
      data: this.data,
      request_id: req.request_id,
    };
    if (this.type === 'success') {
      return res.status(this.statusCode).json(result);
    }
    return res.status(this.statusCode).json({
      request_id: req.request_id,
    });
  }
}
