import Util from '../../utils/Utils';
import SingleControlService from '../services/SingleControlService';

const util = new Util();

class SingleControlsController {
  static async getSingleControl(req, res) {
    const { single_control_id } = req.query;
    const { company_id } = req.body;
    let singleControlObj = await SingleControlService.getSingleControl(single_control_id)
      .then((result) => result).catch((err) => {
        throw (err);
      });
    if (!singleControlObj) {
      singleControlObj = {};
    }
    util.setSuccess(200, singleControlObj);
    return util.send(req, res);
  }

  static async getGatewaySingleControl(req, res) {
    const { gateway_id, gateway_code, networkwifimac } = req.query;
    const { company_id } = req.body;
    const { occupant_id } = req;
    const { isAdmin } = req.header;
    const singleControls = await SingleControlService.getGatewaySingleControls(gateway_id, networkwifimac, occupant_id, gateway_code, isAdmin)
      .then((result) => result).catch((err) => {
        throw (err);
      });
    util.setSuccess(200, singleControls);
    return util.send(req, res);
  }

  static async addSingleControl(req, res) {
    const {
      name, default_device_id, gateway_id, company_id, devices,
    } = req.body;
    const { occupant_id } = req;
    const { user_id } = req;
    const singleControlObj = await SingleControlService.addSingleControl(name, devices, default_device_id, gateway_id, company_id, user_id, occupant_id)
      .then((result) => result).catch((err) => {
        throw (err);
      });
    util.setSuccess(200, singleControlObj);
    return util.send(req, res);
  }

  static async updateSingleControl(req, res) {
    const {
      id, name, default_device_id, gateway_id, company_id, devices,
    } = req.body;
    const { user_id, occupant_id } = req;
    const singleControlObj = await SingleControlService.updateSingleControl(id, name, devices, default_device_id, gateway_id, company_id, user_id, occupant_id)
      .then((result) => result)
      .catch((err) => {
        throw (err);
      });
    util.setSuccess(200, singleControlObj);
    return util.send(req, res);
  }

  static async deleteSingleControl(req, res) {
    const { single_control_id } = req.query;
    const { company_id } = req.body;
    const { user_id, occupant_id } = req;
    const singleControlObj = await SingleControlService.deleteSingleControl(single_control_id, company_id, user_id, occupant_id)
      .then((result) => result)
      .catch((err) => {
        throw (err);
      });
    util.setSuccess(200, singleControlObj);
    return util.send(req, res);
  }
}

export default SingleControlsController;
