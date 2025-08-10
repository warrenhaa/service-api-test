import Util from '../../utils/Utils';
import addAlertCommunicationConfigs from '../services/AlertCommunicationConfigsServices';
import ApplicationError from '../../errors/ApplicationError';

const util = new Util();

class AlertCommunicationConfigsController {
  static async addAlertCommunicationConfigs(req, res) {
    const data = req.body.alert_configs;
    let addAlertCommunicationConfig = null;
    const resultArray = [];
    for (const key in data) {
      const alert = data[key];
      const info = {
        alert_type: alert.alert_type,
        alert_message: alert.alert_message,
        user_id: req.user_id || null,
        occupant_id: req.occupant_id || null,
        device_id: alert.device_id || null,
        device_code: alert.device_code || null,
        company_id: req.company_id || null,
        sms_enabled: alert.sms_enabled,
        email_enabled: alert.email_enabled,
        notification_enabled: alert.notification_enabled,
      };
      addAlertCommunicationConfig = await addAlertCommunicationConfigs.addAlertCommunicationConfigs(info)
        .catch((e) => {
          const err = e;
          throw new ApplicationError(err);
        });
      if (addAlertCommunicationConfig) {
        resultArray.push(addAlertCommunicationConfig);
      }
    }
    util.setSuccess(200, resultArray);
    return util.send(req, res);
  }

  static async getAlertCommunicationConfigs(req, res) {
    const data = {
      user_id: req.user_id || null,
      occupant_id: req.occupant_id || null,
      device_id: req.query.device_id || null,
      device_code: req.query.device_code || null,
      company_id: req.company_id || null,
    };
    const status = await addAlertCommunicationConfigs.getAlertCommunicationConfigs(data)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, status);
    return util.send(req, res);
  }
}

export default AlertCommunicationConfigsController;
