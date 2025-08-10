import Util from '../../utils/Utils';
import StatusService from '../services/StatusService';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';

const util = new Util();

class StatusController {
  static async getStatus(req, res) {
    const status = await StatusService.getStatus(req).catch(() => {
      const error = ErrorCodes['170001'];
      throw new ApplicationError(error);
    });
    util.setSuccess(200, status);
    return util.send(req, res);
  }
}

export default StatusController;
