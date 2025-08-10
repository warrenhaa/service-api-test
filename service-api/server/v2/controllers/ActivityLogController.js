import Util from '../../utils/Utils';
import ActivityLogs from '../services/ActivityLogs';
import ErrorCodes from '../../errors/ErrorCodes';

const util = new Util();

class ActivityLogController {
  static async getAllActivityLog(req, res) {
    const activityLogs = await ActivityLogs.getAllActivityLogs(req);
    if (activityLogs.count > 0) {
      util.setSuccess(200, activityLogs);
    } else {
      res.setHeader('x-response-code', 'LMC_INF');
      util.setSuccess(404);
    }
    return util.send(req, res);
  }

  static async createActivityLog(req, res) {
    try {
      const activityLog = await ActivityLogs.createActivityLogs(req.body);
      util.setSuccess(200, activityLog);
      return util.send(req, res);
    } catch (error) {
      const err = ErrorCodes['990001'];
      throw new ApplicationError(err);
    }
  }
}

export default ActivityLogController;
