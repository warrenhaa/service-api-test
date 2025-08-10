import Util from '../../utils/Utils';
import AlertsService from '../services/AlertsService';

const util = new Util();

class AlertsController {
  static async getAllAlerts(req, res) {
    const alerts = await AlertsService.getAllAlerts(req);
    util.setSuccess(200, alerts);
    return util.send(req, res);
  }

  static async updateDeviceAlert(req, res) {
    const { company_id, occupant_id } = req;
    const { alert_id } = req.body;
    const alerts = await AlertsService.updateDeviceAlert(alert_id, company_id, occupant_id);
    util.setSuccess(200, alerts);
    return util.send(req, res);
  }
}

export default AlertsController;
