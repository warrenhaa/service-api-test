import Util from '../../utils/Utils';
import SchedulesService from '../services/SchedulesService';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';

const util = new Util();

class SchedulesController {
  static async getSchedules(req, res) {
    const { id } = req.params;
    const { company_id } = req.body;
    const { occupant_id, user_id } = req;
    const schedulesObj = await SchedulesService.getSchedules(id, company_id, occupant_id, user_id)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, schedulesObj);
    return util.send(req, res);
  }

  static async getAllSchedules(req, res) {
    let { device_id, device_code, networkwifimac } = req.query;
    const { occupant_id, user_id } = req;
    const { euid } = req.query;
    const { company_id } = req.body;
    const { isAdmin } = req.header;

    let getMac = null;
    let where = null;
    let getDevice = null;
    if (networkwifimac) {
      networkwifimac = networkwifimac.toUpperCase();
    }
    if (euid && networkwifimac) {
      getMac = await SchedulesService.getMacAddress(euid);
      where = { mac_address: getMac, company_id };
      // check valid euid based
      const euid_array = await SchedulesService.euidRecord(where)
        .catch((error) => {
          throw (error);
        });
      if (euid_array.length < 1) {
        const err = ErrorCodes['800019'];
        throw err;
      }
      // will get array
      for (const key in euid_array) {
        const element = euid_array[key];
        const euid_device_code = element.device_code;
        let euid_networkwifimac = euid_device_code.split('-');
        euid_networkwifimac = euid_networkwifimac[1];
        if (networkwifimac == euid_networkwifimac) {
          getDevice = element;
          device_id = getDevice.id;
        }
      }
    }
    const schedulesObj = await SchedulesService.getAllSchedules(device_id, company_id, occupant_id, user_id, device_code, isAdmin)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, schedulesObj);
    return util.send(req, res);
  }

  static async getDeviceSchedules(req, res) {
    const { ref } = req.query;
    const deviceSchedules = await SchedulesService.getDeviceSchedules(ref)
      .catch((e) => {
        const err = e;
        throw (err);
      });
    if (deviceSchedules) {
      res.status(200).json(deviceSchedules);
    } else {
      const err = ErrorCodes['410007'];
      throw new ApplicationError(err);
    }
  }

  static async addSchedules(req, res) {
    let { networkwifimac } = req.body;
    const {
      schedules, company_id, euid, device_id,
    } = req.body;
    const { occupant_id, user_id } = req;
    if (networkwifimac) {
      networkwifimac = networkwifimac.toUpperCase();
    }
    const source_IP = req.source_IP;
    const schedulesObj = await SchedulesService.addSchedules(schedules, device_id, company_id, user_id, occupant_id, euid, networkwifimac, source_IP)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, schedulesObj);
    return util.send(req, res);
  }

  static async updateSchedules(req, res) {
    let { networkwifimac } = req.body;
    const {
      schedules, company_id, euid, device_id,
    } = req.body;
    const { user_id, occupant_id } = req;
    if (networkwifimac) {
      networkwifimac = networkwifimac.toUpperCase();
    }
    const source_IP = req.source_IP;
    const schedulesObj = await SchedulesService.updateSchedules(schedules, device_id, euid, user_id, occupant_id, company_id, networkwifimac, source_IP)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, schedulesObj);
    return util.send(req, res);
  }

  static async updateDuplicateSchedules(req, res) {
    const { from_device_id, to_device_ids, company_id } = req.body;
    const { user_id, occupant_id } = req;
    const source_IP = req.source_IP;
    const schedulesObj = await SchedulesService.updateDuplicateSchedules(from_device_id, to_device_ids, user_id, occupant_id, company_id, "schedule", source_IP)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, schedulesObj);
    return util.send(req, res);
  }
  static async enableDeviceSchedules(req, res) {
    const {
      device_id, property_name, is_enable, company_id,
    } = req.body;
    const { user_id, occupant_id } = req;
    const schedulesObj = await SchedulesService.enableDeviceSchedules(device_id, property_name, is_enable, user_id, occupant_id, company_id)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, schedulesObj);
    return util.send(req, res);
  }

  static async deleteSchedules(req, res) {
    const { id } = req.params;
    const { company_id } = req.body;
    const { user_id, occupant_id } = req;
    const source_IP = req.source_IP;
    const schedulesObj = await SchedulesService.deleteSchedules(id, company_id, user_id, occupant_id, source_IP)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, schedulesObj);
    return util.send(req, res);
  }

  static async deleteAllSchedules(req, res) {
    let { device_id, networkwifimac } = req.query;
    const { euid } = req.query;
    const { company_id } = req.body;
    const { user_id, occupant_id } = req;
    let getMac = null;
    let where = null;
    let getDevice = null;
    const source_IP = req.source_IP;
    if (networkwifimac) {
      networkwifimac = networkwifimac.toUpperCase();
    }
    if (euid && networkwifimac) {
      getMac = await SchedulesService.getMacAddress(euid);
      where = { mac_address: getMac, company_id };
      // check valid euid based
      const euid_array = await SchedulesService.euidRecord(where)
        .catch((error) => {
          throw (error);
        });
      if (euid_array.length < 1) {
        const err = ErrorCodes['800019'];
        throw err;
      }
      // will get array
      for (const key in euid_array) {
        const element = euid_array[key];
        const euid_device_code = element.device_code;
        let euid_networkwifimac = euid_device_code.split('-');
        euid_networkwifimac = euid_networkwifimac[1];
        if (networkwifimac == euid_networkwifimac) {
          getDevice = element;
          device_id = getDevice.id;
        }
      }
    }
    const isToPublish = false;
    const schedulesObj = await SchedulesService.deleteAllSchedules(device_id, company_id, user_id, occupant_id, isToPublish, source_IP)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, schedulesObj);
    return util.send(req, res);
  }
}
export default SchedulesController;
