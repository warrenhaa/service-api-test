import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import Responses from '../../utils/constants/Responses';
import communicateWithAwsIotService from './CommunicateWithAwsIotService';
import OneTouchRulesService from './OneTouchRulesService';
import SingleControlsService from './SingleControlService';
import DevicesService from './DevicesService';
const uuid = require('uuid').v4;
const lodash = require('lodash');
const moment = require('moment');
const { Op } = database.Sequelize;
const constantFromConfigs = require('../../cache/constantFromConfigs')
class SchedulesService {

  static async getSystemMode(company_id, device_code) {
    var params = {
      thingName: device_code, /* required */
    };
    const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
    if (!shadowData) {
      // gateway shadow not updated
      const err = ErrorCodes['410006'];
      throw err;
    }
    var payload = JSON.parse(shadowData.payload);
    let base_key = null;
    const { reported } = payload.state; // array
    let base = null;
    let systemModeValue = null
    Object.keys(reported).forEach((key) => {
      if (reported[key].hasOwnProperty('properties')) {
        const { properties } = reported[key];
        base_key = key;
        if (Object.keys(properties).length > 0) {
          let alertProperty = Object.keys(properties).filter((name) => name.endsWith(":SystemMode"));
          systemModeValue = properties[alertProperty[0]];

          base = Object.keys(properties)[0];
        }
      }
    });

    return systemModeValue;
  }
  static async publishGenScheURL(company_id, device_code, url) {
    var params = {
      thingName: device_code, /* required */
    };
    const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
    if (!shadowData) {
      // gateway shadow not updated
      const err = ErrorCodes['410006'];
      throw err;
    }
    var payload = JSON.parse(shadowData.payload);
    let base_key = null;
    const { reported } = payload.state; // array
    let base = null;
    Object.keys(reported).forEach((key) => {
      if (reported[key].hasOwnProperty('properties')) {
        const { properties } = reported[key];
        base_key = key;
        if (Object.keys(properties).length > 0) {
          base = Object.keys(properties)[0];
        }
      }
    });
    if (!base) {
      const err = ErrorCodes['410006'];
      throw err;
    }
    const baseSplitArray = base.split(':');
    const setGenScheUrl = `${baseSplitArray[0]}:sGenSche:SetGenScheURL`;
    var payload = {
      state:
      {
        desired: {},
      },
    };
    payload.state.desired[base_key] = {
      properties:
        {},
    };
    payload.state.desired[base_key].properties[setGenScheUrl] = url;
    const topic = `$aws/things/${device_code}/shadow/update`;
    var params = {
      topic,
      payload: JSON.stringify(payload),
    };
    const publishShadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'publish').then((data) => data);
    if (!publishShadowData) {
      // not published the url
      const err = ErrorCodes['410006'];
      throw err;
    }
    return { success: true };
  }

  static async getSchedulesData(device_id, company_id) {
    const getSchedules = await database.schedules.findAll({
      where: { device_id },
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['410014'];
      throw err;
    });
    return getSchedules;
  }

  static async deleteSchedulesData(device_id, company_id) {
    const deleteSchedules = await database.schedules.destroy({
      where: { device_id },
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['410005'];
      throw err;
    });
    return deleteSchedules; // null
  }

  static async createSchedulesData(schedule, device_id, deviceCode, company_id, user_id, occupant_id, source_IP) {
    const to_device_id = device_id;
    const device_code = deviceCode;
    const create = await database.schedules.create({
      schedule, device_id, company_id,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['410003'];
      throw err;
    });
    if (!create) {
      const err = ErrorCodes['410003'];
      throw err;
    }
    // if created record then add activitylog and add device_references
    const obj = {
      old: {},
      new: create,
    };
    ActivityLogs.addActivityLog(Entities.schedules.entity_name, Entities.schedules.event_name.added,
      obj, Entities.notes.event_name.added, create.id, company_id, user_id, occupant_id, null, source_IP);

    return create;
  }

  static async getSchedulesDeviceIdBased(device_id, company_id) {
    const getSchedules = await database.schedules.findAll({
      where: { device_id },
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['410014'];
      throw err;
    });
    return getSchedules;
  }

  static async getSchedules(id, company_id, occupant_id, user_id) {
    const getSchedules = await database.schedules.findOne({
      where: { id },
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['410001'];
      throw err;
    });
    if (getSchedules) {
      const deviceExist = await this.getDevice(getSchedules.device_id, company_id);
      if (!deviceExist) {
        const err = ErrorCodes['800019'];
        throw err;
      }
      if (!user_id && occupant_id) {
        const isHavePermission = await database.occupants_permissions.findOne({
          where: {
            [Op.or]: [
              {
                receiver_occupant_id: occupant_id,
                is_temp_access: false,
                gateway_id: deviceExist.gateway_id,
              },
              {
                receiver_occupant_id: occupant_id,
                end_time: {
                  [Op.gte]: moment().toDate(),
                },
                start_time: {
                  [Op.lte]: moment().toDate(),
                },
                is_temp_access: true,
                gateway_id: deviceExist.gateway_id,
              }],
          },
        });
        if (!isHavePermission) {
          const err = ErrorCodes['160045'];
          throw err;
        }
      }
      return getSchedules;
    }
    return {};
  }

  static async getAllSchedules(device_id, company_id, occupant_id, user_id, device_code, isAdmin = false) {
    let where = {};
    if (device_code) {
      where = {
        device_code: device_code,
      };
    } else {
      where = {
        id: device_id,
      };
    }
    const deviceExist = await database.devices.findOne({
      where,
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['800019'];
      throw err;
    });
    if (!deviceExist) {
      const err = ErrorCodes['800019'];
      throw err;
    }
    device_id = deviceExist.id;

    if (isAdmin == false) {
      if (!user_id && occupant_id) {
        const isHavePermission = await database.occupants_permissions.findOne({
          where: {
            [Op.or]: [
              {
                receiver_occupant_id: occupant_id,
                is_temp_access: false,
                gateway_id: deviceExist.gateway_id,
              },
              {
                receiver_occupant_id: occupant_id,
                end_time: {
                  [Op.gte]: moment().toDate(),
                },
                start_time: {
                  [Op.lte]: moment().toDate(),
                },
                is_temp_access: true,
                gateway_id: deviceExist.gateway_id,
              }],
          },
        });
        if (!isHavePermission) {
          const err = ErrorCodes['160045'];
          throw err;
        }
      }
    }

    const getAllSchedules = await database.schedules.findAll({
      where: { device_id },
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['410001'];
      throw err;
    });
    return getAllSchedules;
  }

  static async getDevice(id, company_id) {
    const getDevice = await database.devices.findOne({
      where: { id },
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['800019'];
      throw err;
    });
    return getDevice;
  }

  static async euidRecord(object) {
    const getDevice = await database.devices.findAll({
      where: object,
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['800019'];
      throw err;
    });
    if (!getDevice) {
      const err = ErrorCodes['800019'];
      throw err;
    }
    return getDevice;
  }

  static async deviceRecord(object) {
    const getDevice = await database.devices.findOne({
      where: object,
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['800019'];
      throw err;
    });
    if (!getDevice) {
      const err = ErrorCodes['800019'];
      throw err;
    }
    return getDevice;
  }

  static async countDeviceId(device_id, company_id) {
    let scheduleCount = 0;
    const getDevice = await database.schedules.findAll({
      where: { device_id },
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['800020']; // device id not found
      throw err;
    });
    if (getDevice.length > 0) {
      scheduleCount = Object.keys(getDevice[0]).length;
    }
    return scheduleCount;
  }

  static async calculateSize(Obj) {
    // convert to mb and check requirements
    const size = new TextEncoder().encode(JSON.stringify(Obj)).length;
    const kiloBytes = size / 1024;
    const megaBytes = kiloBytes / 1024;
    return megaBytes;
  }

  static async getDeviceScheduleList(device_id, company_id) {
    const deviceExist = await this.getDevice(device_id, company_id);
    if (!deviceExist) {
      const err = ErrorCodes['800019'];
      throw err;
    }

    const schedulesObj = await this.getAllSchedules(device_id, company_id);
    if (!schedulesObj) {
      const err = ErrorCodes['410007'];
      throw err;
    }
    if (!deviceExist.mac_address) {
      const err = ErrorCodes['410016'];
      throw err;
    }
    let deviceMacAddress = deviceExist.mac_address;
    deviceMacAddress = deviceMacAddress.replace(/:/g, '');
    deviceMacAddress = deviceMacAddress.toLowerCase();

    const arrayOfSchedules = schedulesObj.map(({ schedule }) => schedule);
    const schedulesObject = {
      id: deviceMacAddress,
      schedules: arrayOfSchedules,
    };
    return schedulesObject;
  }

  static async getDeviceSchedules(id) {
    const deviceReferenceObj = await database.device_references.findOne({
      where: { id },
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['420009'];
      throw err;
    });

    if (!deviceReferenceObj) {
      const deviceRefObj = {
        id: null,
        schedules: [],
      };
      return deviceRefObj;
    }

    if (deviceReferenceObj.data && deviceReferenceObj.data != null) {
      return deviceReferenceObj.data;
    } else {
      // check valid device_id
      const deviceExist = await database.devices.findOne({
        where: { id: deviceReferenceObj.device_id },
        raw: true,
      }).then((result) => result).catch((error) => {
        const err = ErrorCodes['800019'];
        throw err;
      });
      if (!deviceExist) {
        const err = ErrorCodes['800019'];
        throw err;
      }
      const getAllSchedules = await database.schedules.findAll({
        where: { device_id: deviceReferenceObj.device_id },
        raw: true,
      }).then((result) => result).catch((error) => {
        const err = ErrorCodes['410001'];
        throw err;
      });
      if (!getAllSchedules) {
        const err = ErrorCodes['410001'];
        throw err;
      }
      if (!deviceExist.mac_address) {
        const err = ErrorCodes['410016'];
        throw err;
      }
      let deviceMacAddress = deviceExist.mac_address;
      deviceMacAddress = deviceMacAddress.replace(/:/g, '');
      deviceMacAddress = deviceMacAddress.toLowerCase();

      const arrayOfSchedules = getAllSchedules.map(({ schedule }) => schedule);
      const schedulesObject = {
        id: deviceMacAddress,
        schedules: arrayOfSchedules,
      };
      return schedulesObject;
    }
  }

  static async getDeviceSchedulesByDeviceId(device_id) {

    // check valid device_id
    const deviceExist = await database.devices.findOne({
      where: { id: device_id },
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['800019'];
      throw err;
    });
    if (!deviceExist) {
      const deviceRefObj = {
        id: null,
        schedules: [],
      };
      return deviceRefObj;
    }
    const getAllSchedules = await database.schedules.findAll({
      where: { device_id: device_id },
      raw: true,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['410001'];
      throw err;
    });
    if (!deviceExist.mac_address) {
      const deviceRefObj = {
        id: null,
        schedules: [],
      };
      return deviceRefObj;
    }
    let deviceMacAddress = deviceExist.mac_address;
    deviceMacAddress = deviceMacAddress.replace(/:/g, '');
    deviceMacAddress = deviceMacAddress.toLowerCase();

    const arrayOfSchedules = getAllSchedules.map(({ schedule }) => schedule);
    const schedulesObject = {
      id: deviceMacAddress,
      schedules: arrayOfSchedules,
    };
    return schedulesObject;
  }
  static async getMacAddress(euid) {
    let deviceMacAddress = euid;
    deviceMacAddress = deviceMacAddress.replace(/(.{2})/g, '\:$1').slice(1);
    deviceMacAddress = deviceMacAddress.toUpperCase();
    return deviceMacAddress;
  }

  static async addSchedules(schedules, device_id, company_id, user_id, occupant_id, euid, networkwifimac, source_IP) {
    let deviceExist = null;
    let calculateScheduleSize = null;
    let calculateScheduleSizeAdd = null;
    let geteuid = null;
    let where = {};
    let actionLength = 0;

    if (euid && networkwifimac) {
      geteuid = await this.getMacAddress(euid); // will get converted mac address
      where = { mac_address: geteuid, };
      // check valid euid based
      const euid_array = await this.euidRecord(where)
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
          deviceExist = element;
        }
      }
    } else {
      where = { id: device_id, };
      // check valid device_id based
      deviceExist = await this.deviceRecord(where).catch((error) => {
        const err = ErrorCodes['800019'];
        throw err;
      });
    }
    if (!deviceExist) {
      const err = ErrorCodes['800019'];
      throw err;
    }
    if (!user_id) {
      const isHavePermission = await database.occupants_permissions.findOne({
        where: {
          [Op.or]: [
            {
              receiver_occupant_id: occupant_id,
              is_temp_access: false,
              gateway_id: deviceExist.gateway_id,
            },
            {
              receiver_occupant_id: occupant_id,
              end_time: {
                [Op.gte]: moment().toDate(),
              },
              start_time: {
                [Op.lte]: moment().toDate(),
              },
              is_temp_access: true,
              gateway_id: deviceExist.gateway_id,
            }],
        },
      });
      if (!isHavePermission) {
        const err = ErrorCodes['160045'];
        throw err;
      }
    }
    device_id = (euid) ? deviceExist.id : device_id;
    // check deviceId has max 200 records
    const deviceScheduleCount = await this.countDeviceId(device_id, company_id);
    if (deviceScheduleCount > 200) {
      const err = ErrorCodes['410010'];
      throw err;
    }
    if (schedules && schedules.length > 0) {
      for (const key in schedules) {
        const schedule = schedules[key];
        // check action size <= 20 in schedule
        actionLength = Object.keys(schedule.action).length;
        if (actionLength > 20) {
          const err = ErrorCodes['410009'];
          throw err;
        }
        // count each schedule size and add together
        calculateScheduleSize = await this.calculateSize(schedule);
        calculateScheduleSizeAdd += calculateScheduleSize;
        calculateScheduleSize = calculateScheduleSizeAdd;
      }
    }
    // checking gateway online or offline
    const gatewayStatus = await this.getDevice(deviceExist.gateway_id, company_id);
    if (gatewayStatus.status === 'offline') {
      const err = ErrorCodes['410008'];
      throw err;
    }
    // check deviceid's code contains these 2 codes
    const matchCode = deviceExist.device_code;

    // check mb condition for 2 device_code
    const scheduleSize = await this.getDeviceScheduleList(device_id, company_id);
    // we get a array list
    // convert to mb and check requirements
    const listSize = await this.calculateSize(scheduleSize);
    let combineSize = listSize + calculateScheduleSize;

    if (!euid) {
      combineSize = calculateScheduleSize;
    }

    if (matchCode === 'CTLG633') { // 2mb
      if (combineSize > 2) {
        const err = ErrorCodes['410011'];
        throw err;
      }
    } else if (matchCode === 'SAU2AG1') { // 3mb
      if (combineSize > 3) {
        const err = ErrorCodes['410012'];
        throw err;
      }
    } else { // 5mb
      if (combineSize > 5) {
        const err = ErrorCodes['410013'];
        throw err;
      }
    }
    if (!euid) {
      // if input payload is conatin device_id we delete all the schedules created on device , then create new schedules
      let isToPublish = false;
      await this.deleteAllSchedules(device_id, company_id, user_id, occupant_id, isToPublish, source_IP)
        .catch((err) => {
          throw err;
        });
    }
    // for loop for adding all records
    for (const key in schedules) {
      const schedule = schedules[key];
      const addSchedules = await database.schedules.create({
        schedule, device_id, company_id,
      }).then((result) => result).catch((error) => {
        const err = ErrorCodes['410003'];
        throw err;
      });
      const Obj = {
        old: {},
        new: addSchedules,
      };
      if (addSchedules) {
        ActivityLogs.addActivityLog(Entities.schedules.entity_name, Entities.schedules.event_name.added,
          Obj, Entities.notes.event_name.added, addSchedules.id, company_id, user_id, occupant_id, null, source_IP);
      }
    }
    // creeting reference in device_references.
    const deviceReferenceObj = await DevicesService.addDeviceReference(device_id);
    if (!deviceReferenceObj) {
      const err = ErrorCodes['410006'];
      throw err;
    }
    const { device_code } = deviceExist;
    const ref = deviceReferenceObj.id;
    const host = process.env.SERVICE_API_HOST;
    const url = `https://${host}/api/v1/schedules/device_schedules?ref=${ref}`;
    await this.publishGenScheURL(company_id, device_code, url);

    // #1.. first check whether device_id present in scd's table or not if yes
    // #2.. get the scd_id's other connected device_id list
    // #1..
    const checkSCD_Exist = await SingleControlsService.getSingleControlDevices(device_id)
      .catch((err) => {
        throw err;
      });
    if (checkSCD_Exist && Object.keys(checkSCD_Exist).length > 0) {
      // #2..
      const allDevicesList = await SingleControlsService.getSingleControlDevicesList(checkSCD_Exist.single_control_id)
        .catch((err) => {
          throw err;
        });
      if (allDevicesList && allDevicesList.length > 0) {
        const devicesList = lodash.map(allDevicesList, 'device_id');
        //  #3.. call the duplicate schedules function to create the same record for all the devices
        await this.updateDuplicateSchedules(device_id, devicesList, user_id, occupant_id, company_id, "single_control", source_IP)
          .then((result) => result).catch((e) => {
            const err = e;
            throw (err);
          });
      }
    }
    const returnArray = await this.getAllSchedules(device_id, company_id);
    return returnArray;
  }

  static async updateSchedules(schedules, deviceid, euid, user_id, occupant_id, company_id, networkwifimac, source_IP) {
    const oldObj = {};
    const newObj = {};
    let afterUpdate = null;
    let deviceExist = null;
    let calculateScheduleSize = null;
    let calculateScheduleSizeAdd = null;
    let geteuid = null;
    let where = {};
    let actionLength = 0;

    if (euid && networkwifimac) {
      geteuid = await this.getMacAddress(euid); // will get converted mac address
      where = { mac_address: geteuid, };
      // check valid euid based
      const euid_array = await this.euidRecord(where)
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
          deviceExist = element;
        }
      }
    } else {
      where = { id: deviceid, };
      // check valid device_id or euid based
      deviceExist = await this.deviceRecord(where)
        .catch((error) => {
          throw (error);
        });
    }
    if (!deviceExist) {
      const err = ErrorCodes['800019'];
      throw err;
    }
    if (!user_id) {
      const isHavePermission = await database.occupants_permissions.findOne({
        where: {
          [Op.or]: [
            {
              receiver_occupant_id: occupant_id,
              is_temp_access: false,
              gateway_id: deviceExist.gateway_id,
            },
            {
              receiver_occupant_id: occupant_id,
              end_time: {
                [Op.gte]: moment().toDate(),
              },
              start_time: {
                [Op.lte]: moment().toDate(),
              },
              is_temp_access: true,
              gateway_id: deviceExist.gateway_id,
            }],
        },
      });
      if (!isHavePermission) {
        const err = ErrorCodes['160045'];
        throw err;
      }
    }
    const device_id = (euid) ? deviceExist.id : deviceid;

    // check deviceId has max 200 records
    const deviceScheduleCount = await this.countDeviceId(device_id, company_id);
    if (deviceScheduleCount > 200) {
      const err = ErrorCodes['410010'];
      throw err;
    }

    if (schedules && schedules.length > 0) {
      for (const key in schedules) {
        const schedule_array = schedules[key];
        const { schedule } = schedule_array;
        const { id } = schedule_array;
        if (!id) {
          const err = ErrorCodes['410002']; // schedules id not found
          throw err;
        }
        // put this in multiple for loop // check multiple schedules id present or not
        const existingData = await this.getSchedules(id, company_id);
        if (existingData && Object.keys(existingData).length < 1) {
          const err = ErrorCodes['410002']; // id not found
          throw err;
        }
        // check action size <= 20 in schedule
        actionLength = Object.keys(schedule.action).length;
        // check condition-1
        if (actionLength > 20) {
          const err = ErrorCodes['410009'];
          throw err;
        }
        // count each schedule size and add together
        calculateScheduleSize = await this.calculateSize(schedule);
        calculateScheduleSizeAdd += calculateScheduleSize;
        calculateScheduleSize = calculateScheduleSizeAdd;
      }
    }
    // extra condition check for update  // checking gateway online or offline
    const gatewayStatus = await this.getDevice(deviceExist.gateway_id, company_id);
    if (gatewayStatus.status === 'offline') {
      const err = ErrorCodes['410008'];
      throw err;
    }

    // -----------------------------check condition-2------------------------------

    const matchCode = deviceExist.device_code;
    // check mb condition for 2 device_code
    const scheduleSize = await this.getDeviceScheduleList(device_id, company_id);
    // we get a array list  // convert to mb and check requirements
    const listSize = await this.calculateSize(scheduleSize);
    const combineSize = listSize + calculateScheduleSize;

    if (matchCode === 'CTLG633') { // 2mb
      if (combineSize > 2) {
        const err = ErrorCodes['410011'];
        throw err;
      }
    } else if (matchCode === 'SAU2AG1') { // 3mb
      if (combineSize > 3) {
        const err = ErrorCodes['410012'];
        throw err;
      }
    } else { // 5mb
      if (combineSize > 5) {
        const err = ErrorCodes['410013'];
        throw err;
      }
    }

    for (const key in schedules) {
      const schedule_array = schedules[key];
      const { schedule } = schedule_array;
      const { id } = schedule_array;
      if (!id) {
        const err = ErrorCodes['410002']; // schedules id not found
        throw err;
      }
      const existingData = await this.getSchedules(id, company_id);
      if (existingData && Object.keys(existingData).length < 1) {
        const err = ErrorCodes['410002']; // id not found
        throw err;
      }
      const updatedData = await database.schedules.update({ schedule }, {
        where: { id, company_id },
        returning: true,
      }).then((result) => result).catch((error) => {
        const err = ErrorCodes['410004'];
        throw err;
      });
      afterUpdate = await this.getSchedules(id, company_id).then((result) => result)
        .catch((error) => {
          const err = ErrorCodes['410002'];
          throw err;
        });

      Object.keys(schedule).forEach((key) => {
        if (JSON.stringify(existingData.schedule[key]) !== JSON.stringify(schedule[key])) {
          oldObj[key] = existingData.schedule[key];
          newObj[key] = schedule[key];
        }
      });
      const obj = {
        old: oldObj,
        new: newObj,
      };
      const deletedExistingData = { ...existingData };
      delete deletedExistingData.updated_at;

      const deletedAfterUpdate = { ...afterUpdate };
      delete deletedAfterUpdate.updated_at;

      if (JSON.stringify(deletedExistingData) !== JSON.stringify(deletedAfterUpdate)) {
        ActivityLogs.addActivityLog(Entities.schedules.entity_name, Entities.schedules.event_name.updated,
          obj, Entities.notes.event_name.updated, existingData.id, company_id, user_id, occupant_id, null, source_IP);
      }
    }
    // creeting reference in device_references.
    const deviceReferenceObj = await DevicesService.addDeviceReference(device_id);
    if (!deviceReferenceObj) {
      const err = ErrorCodes['410006'];
      throw err;
    }
    const { device_code } = deviceExist;
    const ref = deviceReferenceObj.id;
    const host = process.env.SERVICE_API_HOST;
    const url = `https://${host}/api/v1/schedules/device_schedules?ref=${ref}`;
    // creates a json object
    await this.publishGenScheURL(company_id, device_code, url);

    // #1.. first check whether device_id present in scd's table or not if yes
    // #2.. get the scd_id's other connected device_id list
    // #1..
    const checkSCD_Exist = await SingleControlsService.getSingleControlDevices(device_id)
      .catch((err) => {
        throw err;
      });
    if (checkSCD_Exist && Object.keys(checkSCD_Exist).length > 0) {
      // #2..
      const allDevicesList = await SingleControlsService.getSingleControlDevicesList(checkSCD_Exist.single_control_id)
        .catch((err) => {
          throw err;
        });
      if (allDevicesList && allDevicesList.length > 0) {
        const devicesList = lodash.map(allDevicesList, 'device_id');
        //  #3.. call the duplicate schedules function to create the same record for all the devices
        await this.updateDuplicateSchedules(device_id, devicesList, user_id, occupant_id, company_id, "single_control", source_IP)
          .then((result) => result).catch((e) => {
            const err = e;
            throw (err);
          });
      }
    }
    const returnArray = await this.getAllSchedules(device_id, company_id);
    return returnArray;
  }

  static async enableDeviceSchedules(device_id, property_name, is_enable, user_id, occupant_id, company_id) {
    const where = { id: device_id };
    const deviceExist = await this.deviceRecord(where).catch((error) => {
      throw error;
    });
    if (!deviceExist) {
      const err = ErrorCodes['800019'];
      throw err;
    }
    const schedules = await this.getSchedulesDeviceIdBased(device_id, company_id)
      .catch((error) => {
        const err = ErrorCodes['410014'];
        throw err;
      });
    if (schedules && schedules.length > 0) {
      for (const element of schedules) {
        const { schedule } = element;

        for (const i in schedule.action) {
          if (schedule.action[i].name == property_name) {
            schedule.action[i].en = is_enable;
          }
        }
      }
      const updatedSchedule = await this.updateSchedules(schedules, device_id, null, user_id, occupant_id, company_id, null).catch((e) => {
        const err = e;
        throw (err);
      });
      return updatedSchedule;
    }
    return schedules;
  }

  static async updateDuplicateSchedules(from_device_id, to_device_ids, user_id, occupant_id, company_id, type, source_IP) {
    let deviceExist = null;
    let schedulesExist = null;
    let where = {};
    where = { id: from_device_id, };
    // check from_device_id exist or not in devices table.
    deviceExist = await this.deviceRecord(where).catch((error) => {
      throw error;
    });
    if (!deviceExist) {
      const err = ErrorCodes['800019'];
      throw err;
    }
    if (!user_id) {
      const isHavePermission = await database.occupants_permissions.findOne({
        where: {
          [Op.or]: [
            {
              receiver_occupant_id: occupant_id,
              is_temp_access: false,
              gateway_id: deviceExist.gateway_id,
            },
            {
              receiver_occupant_id: occupant_id,
              end_time: {
                [Op.gte]: moment().toDate(),
              },
              start_time: {
                [Op.lte]: moment().toDate(),
              },
              is_temp_access: true,
              gateway_id: deviceExist.gateway_id,
            }],
        },
      });
      if (!isHavePermission) {
        const err = ErrorCodes['160045'];
        throw err;
      }
    }
    const schedulesFromDeviceId = await this.getSchedulesDeviceIdBased(from_device_id, company_id)
      .catch((error) => {
        const err = ErrorCodes['410014'];
        throw err;
      });
    if (!schedulesFromDeviceId && schedulesFromDeviceId.length < 1) {
      const err = ErrorCodes['410014'];
      throw err;
    }
    // to delete the present device id's from schedules table.
    for (const key in to_device_ids) {
      const to_device_id = to_device_ids[key];
      where = { id: to_device_id };
      let fromdeviceExist = await this.deviceRecord(where);
      if (!fromdeviceExist) {
        const err = ErrorCodes['800019'];
        throw err;
      }
      schedulesExist = await this.getSchedulesData(to_device_id, company_id)
        .catch((error) => {
          const err = ErrorCodes['410014'];
          throw err;
        });
      if (schedulesExist && schedulesExist.length > 0) {
        // delete record
        const deleteSchedulesExist = await this.deleteSchedulesData(to_device_id, company_id)
          .then((result) => result).catch((e) => {
            const err = e;
            throw (err);
          });
        const obj = {
          old: schedulesExist[0],
          new: {},
        };
        ActivityLogs.addActivityLog(Entities.schedules.entity_name, Entities.schedules.event_name.deleted,
          obj, Entities.notes.event_name.deleted, to_device_id, company_id, user_id, occupant_id, null, source_IP);
      }
      let fromsystemMode = await this.getSystemMode(company_id, deviceExist.device_code).catch(error => {
        console.log("🚀 ~ SchedulesService ~ fromHoldType ~ err:", error)
        const err = ErrorCodes['410006'];
        throw err;
      })
      let constants = await constantFromConfigs.data('constants');
      let tosystemMode = null
      if (constants.DuplicateSchedulesConvertHeatCool && constants.DuplicateSchedulesConvertHeatCool.includes(fromdeviceExist.model) && constants.DuplicateSchedulesConvertHeatCool.includes(deviceExist.model)) {
        tosystemMode = await this.getSystemMode(company_id, fromdeviceExist.device_code).catch(error => {
          console.log("🚀 ~ SchedulesService ~ fromHoldType ~ err:", error)
          const err = ErrorCodes['410006'];
          throw err;
        })
      }

      for (const key in schedulesFromDeviceId) {
        const element = schedulesFromDeviceId[key];
        let schedulesFromDeviceId_Schedule = element.schedule;

        where = { id: to_device_id };
        let fromdeviceExist = await this.deviceRecord(where);
        if (!fromdeviceExist) {
          const err = ErrorCodes['800019'];
          throw err;
        }
        if (constants.DuplicateSchedulesConvertHeatCool && constants.DuplicateSchedulesConvertHeatCool.includes(fromdeviceExist.model) && constants.DuplicateSchedulesConvertHeatCool.includes(deviceExist.model)) {
          if (fromsystemMode && tosystemMode) {
            if (fromsystemMode != tosystemMode && tosystemMode == 3) {
              let schedulesFromDeviceIdScheduleStringify = JSON.stringify(schedulesFromDeviceId_Schedule)
              schedulesFromDeviceIdScheduleStringify = schedulesFromDeviceIdScheduleStringify.replace(/SetAutoHeatingSetpoint_x100/g, 'SetAutoCoolingSetpoint_x100')
              schedulesFromDeviceId_Schedule = JSON.parse(schedulesFromDeviceIdScheduleStringify)
            } else if (fromsystemMode != tosystemMode && tosystemMode == 4) {
              let schedulesFromDeviceIdScheduleStringify = JSON.stringify(schedulesFromDeviceId_Schedule)
              schedulesFromDeviceIdScheduleStringify = schedulesFromDeviceIdScheduleStringify.replace(/SetAutoCoolingSetpoint_x100/g, 'SetAutoHeatingSetpoint_x100')
              schedulesFromDeviceId_Schedule = JSON.parse(schedulesFromDeviceIdScheduleStringify)
            }

          }
        }
        // add record
        const create = await this.createSchedulesData(schedulesFromDeviceId_Schedule, to_device_id, fromdeviceExist.device_code, company_id, user_id, occupant_id, source_IP)
          .then((result) => result).catch((e) => {
            const err = e;
            throw (err);
          });

      }

      const deviceReferenceObj = await DevicesService.addDeviceReference(to_device_id);
      if (!deviceReferenceObj) {
        const err = ErrorCodes['410006'];
        throw err;
      }
      let ref = deviceReferenceObj.id;
      // if(type == 'single_control'){
      //   ref = uuid()
      // }
      if (type == 'single_control') {
        await this.publishGenScheURL(company_id, fromdeviceExist.device_code, "NULL");
      } else {
        const host = process.env.SERVICE_API_HOST;
        const url = `https://${host}/api/v1/schedules/device_schedules?ref=${ref}`;
        await this.publishGenScheURL(company_id, fromdeviceExist.device_code, url);
      }
    }

    // check all device ids are present in devices tabe as well as in schedules table.
    // if present in schedules delete and if not create even if missing create new record.
    const returnArray = await this.getAllSchedules(from_device_id, company_id);
    return returnArray;
  }

  static async deleteSchedules(id, company_id, user_id, occupant_id, source_IP) {
    const deleteSchedules = await database.schedules.findOne({
      where: { id },
    });
    if (!deleteSchedules) {
      const err = ErrorCodes['410002'];
      throw err;
    }
    const deletedData = await database.schedules.destroy({
      where: { id },
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['410005'];
      throw err;
    });

    // check valid device_id
    const deviceExist = await this.getDevice(deleteSchedules.device_id, company_id);
    if (!deviceExist) {
      const err = ErrorCodes['800019'];
      throw err;
    }
    // creeting reference in device_references.
    const deviceReferenceObj = await DevicesService.addDeviceReference(deleteSchedules.device_id);
    if (!deviceReferenceObj) {
      const err = ErrorCodes['410006'];
      throw err;
    }
    const { device_code } = deviceExist;
    const ref = deviceReferenceObj.id;
    const host = process.env.SERVICE_API_HOST;
    const url = `https://${host}/api/v1/schedules/device_schedules?ref=${ref}`;
    // creates a json object
    await this.publishGenScheURL(company_id, device_code, url);

    // #1.. first check whether device_id present in scd's table or not if yes
    // #2.. get the scd_id's other connected device_id list
    // #1..
    const { device_id } = deleteSchedules;
    const checkSCD_Exist = await SingleControlsService.getSingleControlDevices(device_id)
      .catch((err) => {
        throw err;
      });
    if (checkSCD_Exist && Object.keys(checkSCD_Exist).length > 0) {
      // #2..
      const allDevicesList = await SingleControlsService.getSingleControlDevicesList(checkSCD_Exist.single_control_id)
        .catch((err) => {
          throw err;
        });
      if (allDevicesList && allDevicesList.length > 0) {
        const devicesList = lodash.map(allDevicesList, 'device_id');
        //  #3.. call the duplicate schedules function to create the same record for all the devices
        await this.updateDuplicateSchedules(device_id, devicesList, user_id, occupant_id, company_id, "single_control", source_IP)
          .then((result) => result).catch((e) => {
            const err = e;
            throw (err);
          });
      }
    }

    const obj = {
      old: deleteSchedules,
      new: {},
    };
    ActivityLogs.addActivityLog(Entities.schedules.entity_name, Entities.schedules.event_name.deleted,
      obj, Entities.notes.event_name.deleted, deleteSchedules.device_id, company_id, user_id, occupant_id, null, source_IP);
    // return deletedData;
    return {
      message: Responses.responses.schedules_delete_message,
    };
  }

  static async deleteAllSchedules(device_id, company_id, user_id, occupant_id, isToPublish, source_IP) {
    // check valid device_id
    const deviceExist = await this.getDevice(device_id, company_id);
    if (!deviceExist) {
      const err = ErrorCodes['800019'];
      throw err;
    }
    const deleteSchedules = await database.schedules.findAll({
      where: { device_id },
    });
    if (!deleteSchedules) {
      const err = ErrorCodes['800020']; // device id not found
      throw err;
    }

    if (deleteSchedules && deleteSchedules.length > 0) {

      const deletedData = await database.schedules.destroy({
        where: { device_id: device_id },
      }).then((result) => result).catch((error) => {
        const err = ErrorCodes['410005'];
        throw err;
      });

      // creeting reference in device_references.
      if (isToPublish == true) {
        const deviceReferenceObj = await DevicesService.addDeviceReference(device_id);
        if (!deviceReferenceObj) {
          const err = ErrorCodes['410006'];
          throw err;
        }
        const { device_code } = deviceExist;
        const ref = deviceReferenceObj.id;
        const host = process.env.SERVICE_API_HOST;
        const url = `https://${host}/api/v1/schedules/device_schedules?ref=${ref}`;
        // creates a json object
        await this.publishGenScheURL(company_id, device_code, url);
      }
      const checkSCD_Exist = await SingleControlsService.getSingleControlDevices(device_id)
        .catch((err) => {
          throw err;
        });
      if (checkSCD_Exist && Object.keys(checkSCD_Exist).length > 0) {
        // #2..
        const allDevicesList = await SingleControlsService.getSingleControlDevicesList(checkSCD_Exist.single_control_id)
          .catch((err) => {
            throw err;
          });
        if (allDevicesList && allDevicesList.length > 0) {
          const devicesList = lodash.map(allDevicesList, 'device_id');
          //  #3.. call the duplicate schedules function to create the same record for all the devices
          await this.updateDuplicateSchedules(device_id, devicesList, user_id, occupant_id, company_id, "single_control", source_IP)
            .then((result) => result).catch((e) => {
              const err = e;
              throw (err);
            });
        }
      }
      for (const element of deleteSchedules) {
        const obj = {
          old: element,
          new: {},
        };
        ActivityLogs.addActivityLog(Entities.schedules.entity_name, Entities.schedules.event_name.deleted,
          obj, Entities.notes.event_name.deleted, element.device_id, company_id, user_id, occupant_id, null, source_IP);
      };
    }
    // return deleteSchedules;
    return {
      message: Responses.responses.multiple_schedules_delete_message,
    };
  }
}

export default SchedulesService;
