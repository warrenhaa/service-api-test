import Util from '../../utils/Utils';
import OneTouchCbCommunicationConfigService from '../services/OneTouchCbCommunicationConfigService';

const util = new Util();

class OneTouchCbCommunicationConfigController {
  static async getArrayId(req, res) {
    const { gateway_code } = req.query;
    const { occupant_id } = req;
    const oneTouchCbCommunicationConfig = await OneTouchCbCommunicationConfigService.getArrayId(gateway_code, occupant_id)
      .then((result) => result)
      .catch((e) => {
        throw (e);
      });
    util.setSuccess(200, oneTouchCbCommunicationConfig);
    return util.send(req, res);
  }

  static async addCbConfigs(req, res) {
    const { gateway_code, config_type, camera_id, array_id,
      property_name, property_value, ruleop, device_code } = req.body;
    const { occupant_id } = req;
    console.log("🚀 ~ file: oneTouchCbCommunicationConfigController.js:23 ~ OneTouchCbCommunicationConfigController ~ addCbConfigs ~ occupant_id:", occupant_id)
    const oneTouchCbCommunicationConfig = await OneTouchCbCommunicationConfigService.addCbConfigs(
      gateway_code, config_type, camera_id, array_id, property_name,
      property_value, ruleop, device_code, occupant_id)
      .then((result) => result)
      .catch((e) => {
        throw (e);
      });
    util.setSuccess(200, oneTouchCbCommunicationConfig);
    return util.send(req, res);
  }
}

export default OneTouchCbCommunicationConfigController;
