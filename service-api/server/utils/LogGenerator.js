import moment from 'moment';

const geoip = require('geoip-lite');

class LogGenerator {
  constructor() {
    this.logJson = {};
  }

  getJsonFormattedLog(req, res, error) {
    const { body } = req;
    const { method } = req;
    const { params } = req;
    const url = req.baseUrl;
    const { headers } = req;
    const request = {};
    request.headers = headers;
    request.params = params;
    request.method = method;
    request.body = body;
    request.uri = url;
    this.logJson = {};
    this.logJson.request = request;
    const utcMoment = moment.utc();
    const utcDate = new Date(utcMoment.format()).toString();
    this.logJson.timestamp = utcDate;
    this.logJson.client_ip = req.ip;
    const httpResponse = {};
    const reqHeaders = res.getHeaders();
    if ('x-auth-token' in reqHeaders) {
      delete reqHeaders['x-auth-token'];
    }
    if ('authorization' in reqHeaders) {
      delete reqHeaders.authorization;
    }
    httpResponse.headers = res.getHeaders();
    httpResponse.status = res.statusCode;
    const geo = geoip.lookup(req.ip);
    if (geo) {
      this.logJson['http_request.city'] = geo.city;
      this.logJson['http_request.country'] = geo.country;
      this.logJson['http_request.location'] = geo.ll;
    }
    this.logJson.http_response = httpResponse;
    if (error) {
      this.logJson.stackTrace = error.stack;
    }
    return this.logJson;
  }
}

export default LogGenerator;
