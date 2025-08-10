import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';

class AlertCommunicationConfigsService {
  static async addAlertCommunicationConfigs(data) {
    const deviceCode = data.device_code;
    let deviceId = null;
    if (deviceCode) {
      const device = await this.getDeviceId(deviceCode, data.company_id);
      deviceId = device;
    } else {
      deviceId = data.device_id;
      const device = await database.devices.findAll({
        where:
      {
        id: deviceId,
      },
      });
      if (device.length <= 0) {
        const err = ErrorCodes['800002'];
        throw err;
      }
    }
    const getAletCommConfig = await database.alert_communication_configs.findOne({
      where: {
        alert_type: data.alert_type,
        device_id: deviceId,
        user_id: data.user_id,
        occupant_id: data.occupant_id,
        company_id: data.company_id,
      },
    });
    if (getAletCommConfig) {
      const oldObj = {};
      const newObj = {};
      const alertCommId = getAletCommConfig.id;
      const updateAlertCommConfig = await this.UpdateAlertCommunicationConfigs(data, alertCommId);
      if (!updateAlertCommConfig) {
        const err = ErrorCodes['360002'];
        throw err;
      }
      Object.keys(updateAlertCommConfig).forEach((key) => {
        if (updateAlertCommConfig.hasOwnProperty(key)
          && JSON.stringify(getAletCommConfig[key])
          !== JSON.stringify(updateAlertCommConfig[key])) {
          oldObj[key] = getAletCommConfig[key];
          newObj[key] = updateAlertCommConfig[key];
        }
      });
      const obj = {
        old: oldObj,
        new: newObj,
      };
      await ActivityLogs.addActivityLog(Entities.alert_communication_configs.entity_name,
        Entities.alert_communication_configs.event_name.updated,
        obj, Entities.notes.event_name.updated, alertCommId,
        data.company_id, data.user_id, data.occupant_id);
      return updateAlertCommConfig;
    }
    const addAlertCommConfig = await database.alert_communication_configs.create({
      alert_type: data.alert_type,
      alert_message: data.alert_message,
      user_id: data.user_id || null,
      occupant_id: data.occupant_id || null,
      device_id: deviceId,
      company_id: data.company_id,
      sms_enabled: data.sms_enabled,
      email_enabled: data.email_enabled,
      notification_enabled: data.notification_enabled,
    }).catch((error) => {
      const err = ErrorCodes['360001'];
      if (error.message) {
        err.message = error.message;
      }
      throw err;
    });
    if (!addAlertCommConfig) {
      const err = ErrorCodes['360001'];
      throw err;
    }
    const obj = {
      old: {},
      new: addAlertCommConfig,
    };
    await ActivityLogs.addActivityLog(Entities.alert_communication_configs.entity_name,
      Entities.alert_communication_configs.event_name.added,
      obj, Entities.notes.event_name.added, addAlertCommConfig.id,
      data.company_id, data.user_id, data.occupant_id);
    return addAlertCommConfig;
  }

  static async getDeviceId(deviceCode, companyId) {
    let deviceId = null;
    const device = await database.devices.findAll({
      where:
      {
        device_code: deviceCode,
        company_id: companyId,
      },
    });
    if (device && device.length > 0) {
      deviceId = device.id;
    } else {
      const err = ErrorCodes['800002'];
      throw err;
    }
    return deviceId;
  }

  static async UpdateAlertCommunicationConfigs(data, id) {
    const updateAlertCommConfig = await database.alert_communication_configs.update(
      {
        alert_message: data.alert_message,
        sms_enabled: data.sms_enabled,
        email_enabled: data.email_enabled,
        notification_enabled: data.notification_enabled,
      }, {
        where: { id },
        returning: true,
        plain: true,
      },
    ).then((result) => result[1].dataValues).catch((err) => { throw err; });
    return updateAlertCommConfig;
  }

  static async getAlertCommunicationConfigs(data) {
    const deviceCode = data.device_code;
    let deviceId = null;
    if (deviceCode) {
      const device = await this.getDeviceId(deviceCode, data.company_id);
      deviceId = device;
    } else {
      deviceId = data.device_id;
    }
    const getAletCommConfig = await database.alert_communication_configs.findAll({
      where: {
        device_id: deviceId,
        user_id: data.user_id,
        occupant_id: data.occupant_id,
      },
      raw: true,
    });
    if (!getAletCommConfig) {
      const err = ErrorCodes['360003'];
      throw err;
    }
    return getAletCommConfig;
  }
}

export default AlertCommunicationConfigsService;
