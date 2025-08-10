import Util from '../../utils/Utils';
import OneTouchCommunicationConfigService from '../services/OneTouchCommunicationConfigService';

const util = new Util();

class OneTouchCommunicationConfigController {
  static async getOneTouchCommunicationConfig(req, res) {
    const { one_touch_config_id } = req.query;
    const oneTouchCommunicationConfigObj = await OneTouchCommunicationConfigService.getOneTouchCommunicationConfig(one_touch_config_id)
      .then((result) => result)
      .catch((e) => {
        throw (e);
      });
    util.setSuccess(200, oneTouchCommunicationConfigObj);
    return util.send(req, res);
  }

  static async addOneTouchCommunicationConfig(req, res) {
    const {
      one_touch_rule_id, action_trigger_key, emails, phone_numbers, message,
    } = req.body;
    const { company_id } = req;
    const { occupant_id } = req;
    const onetouchCommunicationConfigObj = await OneTouchCommunicationConfigService.addOneTouchCommunicationConfig(one_touch_rule_id, action_trigger_key, emails, phone_numbers, message, company_id, occupant_id)
      .then((result) => result).catch((e) => {
        throw (e);
      });
    util.setSuccess(200, onetouchCommunicationConfigObj);
    return util.send(req, res);
  }

  static async updateOneTouchCommunicationConfig(req, res) {
    const { id } = req.body;
    const { company_id } = req.body;
    const { body } = req;
    const { occupant_id } = req;
    const onetouchCommunicationConfigObj = await OneTouchCommunicationConfigService.updateOneTouchCommunicationConfig(id, body, company_id, occupant_id)
      .then((result) => result).catch((e) => {
        throw (e);
      });
    util.setSuccess(200, onetouchCommunicationConfigObj);
    return util.send(req, res);
  }

  static async deleteOneTouchCommunicationConfig(req, res) {
    const { one_touch_config_id } = req.query;
    const { company_id } = req.body;
    const { occupant_id } = req;
    const onetouchCommunicationConfigObj = await OneTouchCommunicationConfigService.deleteOneTouchCommunicationConfig(one_touch_config_id, company_id, occupant_id)
      .then((result) => result).catch((e) => {
        throw (e);
      });
    util.setSuccess(200, onetouchCommunicationConfigObj);
    return util.send(req, res);
  }
}

export default OneTouchCommunicationConfigController;
