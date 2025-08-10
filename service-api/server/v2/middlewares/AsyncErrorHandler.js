import LogGenerator from '../../utils/LogGenerator';
import Logger from '../../utils/Logger';

const handleErrorAsync = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    const { request_id } = req;
    const code = error.statusCode || 500;
    const responceObj = { request_id, code, message: error.message };
    if (error.responseCode) {
      res.setHeader('x-response-code', error.responseCode);
      responceObj.response_code = error.responseCode;
    }
    res.status(code).send(responceObj);
    if (error.responseCode == '440000') {
      delete error.stack;
    }
    next(error);
  } finally {
  }
};

export default handleErrorAsync;
