import Util from '../../utils/Utils';
import ErrorCodesService from '../services/ErrorCodesService';

const util = new Util();

class ErrorCodesController {
  static async getErrorCodesList(req, res) {
    const obj = await ErrorCodesService.getAllErrorCodes()
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, obj);
    return util.send(req, res);
  }
}

export default ErrorCodesController;
