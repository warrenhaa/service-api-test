import Util from '../../utils/Utils';
import ActivityConfigs from '../services/ActivityConfigs';
import {
  setActivityConfigsOfCompany,
} from '../../cache/Cache';

const util = new Util();

class ActivityConfigsController {
  // currently no one using
  static async getAllActivityConfigs(req, res) {
    const activityLogs = await ActivityConfigs.getActivityConfigsOfCompany(req);
    if (activityLogs.length > 0) {
      util.setSuccess(200, activityLogs);
    } else {
      res.setHeader('x-response-code', 'LMC_INF');

      util.setSuccess(404);
    }
    return util.send(req, res);
  }

  static async createActivityConfigs(req, res) {
    const activityConfig = await ActivityConfigs.createActivityConfigs(req);
    util.setSuccess(200, activityConfig);
    await setActivityConfigsOfCompany(activityConfig.company_id,
      activityConfig.entity, activityConfig);

    return util.send(req, res);
  }

  static async deleteActivityConfig(req, res) {
    const activityConfig = await ActivityConfigs.deleteActivityConfig(req);
    util.setSuccess(200);
    await setActivityConfigsOfCompany(activityConfig.company_id,
      activityConfig.entity, activityConfig);
    return util.send(req, res);
  }
}

export default ActivityConfigsController;
