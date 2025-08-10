const { default: FixExistingUserService } = require('../services/FixExistingUserDP');
const { default: Util } = require('../../utils/Utils');

const util = new Util();

class FixExistingUserController {
  static async getSuperAdmins(req, res) {
    const users = await FixExistingUserService.getSuperAdmins(req);
    util.setSuccess(200, users);
    return util.send(req, res);
  }

  static async getLocationManagers(req, res) {
    const users = await FixExistingUserService.getLocationManagers(req);
    util.setSuccess(200, users);
    return util.send(req, res);
  }

  static async updateDeviceControlPermission(req, res) {
    const result = await FixExistingUserService.updateDeviceControlPermission(req);
    util.setSuccess(200, result);
    return util.send(req, res);
  }

  static async shareDeviceExistingLocationManager(req, res) {
    const result = await FixExistingUserService.shareDeviceExistingLocationManager(req);
    util.setSuccess(200, result);
    return util.send(req, res);
  }
}

export default FixExistingUserController;
