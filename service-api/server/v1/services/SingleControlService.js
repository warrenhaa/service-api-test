import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import SchedulesService from './SchedulesService';
import OneTouchRulesService from './OneTouchRulesService';
import Logger from '../../utils/Logger';

const { Op } = database.Sequelize;
class SingleControlsService {
  static async getSingleControl(id) {
    const getSingleControl = await database.single_controls.findOne({
      attributes: ['id', 'gateway_id', 'name', 'default_device_id'],
      include: [{
        attributes: ['id', 'device_code', 'name', 'model', 'mac_address'],
        model: database.devices,
      },
      {
        model: database.single_control_devices,
        include: [{
          attributes: ['id', 'device_code', 'name', 'model', 'mac_address'],
          model: database.devices,
        }],
      }],
      where: { id },
    }).then((result) => {
      if (!result) {
        return {};
      }
      const obj = result.dataValues;
      if (result.single_control_devices) {
        obj.items = [];
        for (const element of result.single_control_devices) {
          const deviceObj = element.device.dataValues;
          obj.items.push(deviceObj);
        }
      }
      delete obj.single_control_devices;
      return obj;
    }).catch((error) => {
      const err = ErrorCodes['410015'];
      throw err;
    });
    return getSingleControl;
  }

  static async getGatewaySingleControls(gateway_id, networkwifimac, occupant_id, gateway_code) {
    let where = {};
    let deviceInclude = [
      {
        required: false,
        attributes: ['key', 'value'],
        model: database.devices_metadata,
      }, {
        required: false,
        attributes: ['name', 'category_id'],
        model: database.categories,
        as: 'category',
      }]

    if (occupant_id) {
      deviceInclude.push({
        required: false,
        attributes: ['id', 'type', 'grid_order'],
        model: database.occupants_dashboard_attributes,
        where: { occupant_id },
        as: 'dashboard_attributes',
      })
      deviceInclude.push({
        required: false,
        model: database.alert_communication_configs,
        where: {
          occupant_id,
        },
      })
    }
    if (networkwifimac) {
      where = {
        device_code: {
          [Op.iLike]: `%${networkwifimac}%`,
        },
        type: 'gateway',
      };
    } else if (gateway_code) {
      where = {
        device_code: gateway_code,
      };
    } else {
      where = {
        id: gateway_id,
      };
    }
    const gatewayExist = await database.devices.findOne({
      where,
    }).catch(() => {
      const err = ErrorCodes['800013'];
      throw err;
    });
    if (!gatewayExist) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    const gatewayId = gatewayExist.id;
    const singleControls = await database.single_controls.findAll({
      attributes: ['id', 'gateway_id', 'name', 'default_device_id'],
      include: [{
        attributes: ['id', 'device_code', 'name', 'model', 'mac_address'],
        model: database.devices,
      },
      {
        model: database.single_control_devices,
        include: [{
          attributes: ['id', 'device_code', 'name', 'model', 'mac_address'],
          model: database.devices,
          include: deviceInclude,
        }],
      }],
      where: { gateway_id: gatewayId },
    }).then((result) => {
      if (result && result.length < 1) {
        return [];
      }
      const resultArray = [];
      for (const element of result) {
        const obj = element.dataValues;
        if (element.single_control_devices && element.single_control_devices.length > 0) {
          obj.items = [];
          for (const ele of element.single_control_devices) {
            const deviceObj = (ele.device) ? ele.device.dataValues : null;
            obj.items.push(deviceObj);
          }
        }
        delete obj.single_control_devices;
        resultArray.push(obj);
      }
      return resultArray;
    }).catch((error) => {
      console.log("error on line 128:=============", error);
      const err = ErrorCodes['410015'];
      throw err;
    });
    // if having networkwifimac then return linked devices array
    let returnData = null;
    if (networkwifimac) {
      const linkedDeviceList = await OneTouchRulesService.getLinkedDevices(gatewayId);
      returnData = linkedDeviceList;
    } else {
      returnData = singleControls;
    }
    return returnData;
  }

  static async addDeviceReference(device_id) {
    const deviceReferenceObj = await database.device_references.create({
      device_id,
    }).then((result) => result)
      .catch((error) => {
        const err = ErrorCodes['330005'];
        throw err;
      });

    return deviceReferenceObj;
  }

  static async devicesValidation(deviceList, gatewayId) {
    const deviceIds = [];
    for (const data in deviceList) {
      const device = await database.devices.findOne({
        where: {
          id: deviceList[data],
          gateway_id: gatewayId,
        },
        required: true,
      }).catch(() => {
        const err = ErrorCodes['800019'];
        throw err;
      });
      if (!device) {
        deviceIds.push(deviceList[data]);
      }
    }

    if (deviceIds && deviceIds.length > 0) {
      const err = ErrorCodes['800036'];
      err.message = `${deviceIds} this device ids does not belongs to the gateway`;
      throw err;
    }
  }

  static async addSingleControl(name, deviceList, default_device_id, gateway_id, company_id, user_id, occupant_id) {
    // check valid gateway_id
    const gatewayExist = await database.devices.findOne({
      where: { id: gateway_id },
      raw: true,
    }).catch(() => {
      const err = ErrorCodes['800013'];
      throw err;
    });
    if (!gatewayExist) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    await this.devicesValidation(deviceList, gateway_id);

    const existSingleControls = await database.single_control_devices.findAll({
      where: {
        device_id: {
          [Op.in]: deviceList,
        },
      },
    }).catch(() => {
      const err = ErrorCodes['420004'];
      throw err;
    });

    if (existSingleControls && existSingleControls.length > 0) {
      const err = ErrorCodes['420008'];
      throw err;
    }
    // need to check the default device present or not ?
    const defaultDeviceExists = await database.devices.findOne({
      where: {
        id: default_device_id,
        gateway_id,
      },
    }).catch(() => {
      const err = ErrorCodes['800019']; // device not found
      throw err;
    });
    if (!defaultDeviceExists) {
      console.log("default device recordnot found:===============", default_device_id);
      const err = ErrorCodes['800019'];// device not found
      throw err;
    }
    // add single control
    const addSingleGroup = await database.single_controls.create({
      name, default_device_id, gateway_id, company_id,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['420001'];
      throw err;
    });
    const Obj = {
      old: {},
      new: addSingleGroup,
    };

    if (addSingleGroup) {
      if (deviceList.length > 0) {
        // add single control devices
        await this.addSingleControlDevices(addSingleGroup.id, deviceList, occupant_id,
          company_id, gateway_id)
          .catch((err) => {
            throw err;
          });
        const devices = deviceList;
        const index = devices.indexOf(default_device_id);
        if (index > -1) {
          devices.splice(index, 1);
        }
        // whenever we create single control device ,we need to duplicate the schedules of default device to the other device list
        await SchedulesService.updateDuplicateSchedules(default_device_id, devices, user_id, occupant_id, company_id, "single_control")
          .catch((err) => {
            throw err;
          });
      }

      ActivityLogs.addActivityLog(Entities.single_controls.entity_name, Entities.single_controls.event_name.added,
        Obj, Entities.notes.event_name.added, addSingleGroup.id, company_id, user_id, occupant_id, null);
    }
    // creating reference in device rule_reference
    const deviceReferenceObj = await OneTouchRulesService.addDeviceReference(gateway_id);
    if (!deviceReferenceObj) {
      const err = ErrorCodes['330005'];
      throw err;
    }
    const ref = deviceReferenceObj.id;
    const host = process.env.SERVICE_API_HOST || 'dev-service.ctiotsolution.com';
    const url = `https://${host}/api/v1/one_touch/gateway_rules?ref=${ref}`;
    await OneTouchRulesService.publishJsonUrl(company_id, gatewayExist.device_code, url);

    const singleControl = await this.getSingleControl(addSingleGroup.id, company_id)
      .catch((err) => {
        throw err;
      });
    return singleControl;
  }

  static async addSingleControlDevices(singleControlId, deviceList, occupantId, companyId, gatewayId) {
    const checkSingleControl = await this.getSingleControl(singleControlId, companyId)
      .catch((err) => {
        throw err;
      });
    if (checkSingleControl && Object.keys(checkSingleControl).length < 1) {
      const err = ErrorCodes['420002'];
      throw err;
    }
    if (deviceList.length > 0) {
      let nonExistingDevice = null;
      let foundDevice = [];
      for (const deviceId of deviceList) {
        // check devices present from array
        const checkdevice = await database.devices.findOne({
          where: {
            id: deviceId,
          },
          raw: true,
        }).then((result) => result)
          .catch(() => {
            const err = ErrorCodes['800019'];
            throw err;
          });
        if (!checkdevice) {
          nonExistingDevice = deviceId;
          const err = ErrorCodes['800019']; // device not found
          throw err;
        }
        foundDevice.push(deviceId);
      }

      // check single control record still present or not
      if (foundDevice && foundDevice.length == deviceList.length) {
        // check still single control record is there for the gateway
        const singleControlExists = await database.single_controls.findAll({
          where: {
            gateway_id: gatewayId,
          },
          raw: true,
        }).then((result) => result)
          .catch(() => {
            const err = ErrorCodes['490001']; // single control gateway record not found
            throw err;
          });
        if (singleControlExists && singleControlExists.length < 1) {
          console.log("gateway record not exist:===========", gatewayId);
          const err = ErrorCodes['490001']; // single control gateway record not found
          throw err;
        }

        const singleControlDeviceList = [];
        if (singleControlExists && singleControlExists.length > 0) {
          const singleControlDevices = await database.single_control_devices.findAll({
            include:
              [{
                model: database.single_controls,
                where: {
                  gateway_id: gatewayId,
                  company_id: companyId,
                },
              }],
          }).then((result) => {
            if (!result || result.length == 0) {
              return [];
            }
            for (const iterator of result) {
              singleControlDeviceList.push(iterator.device_id);
            }
            return singleControlDeviceList;
          }).catch(() => {
            const err = ErrorCodes['420004'];
            throw err;
          });
        }


        for (const key in foundDevice) {
          const deviceId = foundDevice[key];
          if (!singleControlDeviceList.includes(deviceId)) {
            const singleControlDevices = await database.single_control_devices.create({
              single_control_id: singleControlId,
              device_id: deviceId,
            }).then((result) => result)
              .catch(() => {
                const err = ErrorCodes['420003'];
                throw err;
              });

            const Obj = {
              old: {},
              new: singleControlDevices,
            };
            ActivityLogs.addActivityLog(Entities.single_control_devices.entity_name,
              Entities.single_control_devices.event_name.added,
              Obj, Entities.notes.event_name.added, occupantId,
              companyId, null, occupantId, null);
          }
        }
      } else {
        Logger.error('Error! devices Arrays few device not present in device table', { device_id: nonExistingDevice });
      }

    } else {
      return null;
    }
    const singleControl = await this.getSingleControl(singleControlId, companyId);
    return singleControl;
  }

  static async updateSingleControl(id, name, deviceList, default_device_id, gateway_id, company_id, user_id, occupant_id) {
    const oldObj = {};
    const newObj = {};
    const gatewayExist = await database.devices.findOne({
      where: { id: gateway_id },
      raw: true,
    }).catch(() => {
      const err = ErrorCodes['800013'];
      throw err;
    });
    if (!gatewayExist) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    await this.devicesValidation(deviceList, gateway_id);
    const existingData = await this.getSingleControl(id, company_id)
      .catch((err) => {
        throw err;
      });
    if (existingData && Object.keys(existingData).length < 1) {
      const err = ErrorCodes['420002'];
      throw err;
    }
    const updatebody = {};
    if (existingData.name != name) {
      updatebody.name = name;
    }
    if (existingData.default_device_id != default_device_id) {
      // need to check the default device present or not ?
      const defaultDeviceExists = await database.devices.findOne({
        where: {
          id: default_device_id,
          gateway_id,
        },
      }).catch(() => {
        const err = ErrorCodes['800019']; // device not found
        throw err;
      });
      if (!defaultDeviceExists) {
        console.log("default device not found:===============", default_device_id);
        const err = ErrorCodes['800019'];// device not found
        throw err;
      }
      updatebody.default_device_id = default_device_id;
    }
    if (updatebody != {}) {
      await database.single_controls.update(updatebody, {
        where: {
          id,
          company_id,
        },
      }).then((result) => result)
        .catch(() => {
          const err = ErrorCodes['420005'];
          throw err;
        });
      Object.keys(updatebody).forEach((key) => {
        if (JSON.stringify(existingData[key]) !== JSON.stringify(updatebody[key])) {
          oldObj[key] = existingData[key];
          newObj[key] = updatebody[key];
        }
      });
      const obj = {
        old: oldObj,
        new: newObj,
      };
      ActivityLogs.addActivityLog(Entities.single_controls.entity_name,
        Entities.single_controls.event_name.updated,
        obj, Entities.notes.event_name.updated, occupant_id, company_id, null, occupant_id, null);
    }

    if (deviceList && deviceList.length > 0) {
      // delete first all single control devices
      await database.single_control_devices.destroy({
        where: {
          single_control_id: id,
        },
      }).then((result) => result)
        .catch(() => {
          const err = ErrorCodes['420006'];
          throw err;
        });

      // add single control devices
      await this.addSingleControlDevices(id, deviceList, occupant_id, company_id, existingData.gateway_id)
        .catch((err) => {
          throw err;
        });
      const devices = deviceList;
      const index = devices.indexOf(default_device_id);
      if (index > -1) {
        devices.splice(index, 1);
      }
      // whenever we create single control device, we need to duplicate the schedules of default device to the other device list
      await SchedulesService.updateDuplicateSchedules(default_device_id, devices, user_id, occupant_id, company_id, "single_control")
        .catch((err) => {
          throw err;
        });
    }
    // creating reference in device rule_reference
    const deviceReferenceObj = await OneTouchRulesService.addDeviceReference(existingData.gateway_id);
    if (!deviceReferenceObj) {
      const err = ErrorCodes['330005'];
      throw err;
    }
    const ref = deviceReferenceObj.id;
    const host = process.env.SERVICE_API_HOST || 'dev-service.ctiotsolution.com';
    const url = `https://${host}/api/v1/one_touch/gateway_rules?ref=${ref}`;
    await OneTouchRulesService.publishJsonUrl(company_id, gatewayExist.device_code, url);

    const singleControl = await this.getSingleControl(id, company_id)
      .catch((err) => {
        throw err;
      });
    return singleControl;
  }

  static async deleteSingleControl(id, company_id, user_id, occupant_id) {
    const singleControls = await database.single_controls.findOne({
      where: { id, company_id },
    });
    if (!singleControls) {
      const err = ErrorCodes['420002'];
      throw err;
    }

    const gatewayExist = await database.devices.findOne({
      where: { id: singleControls.gateway_id },
    }).catch(() => {
      const err = ErrorCodes['800013'];
      throw err;
    });

    const singleControlDevices = await database.single_control_devices.findAll({
      where: {
        single_control_id: id,
      },
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const singleControlDevices = [];
      for (const iterator of result) {
        singleControlDevices.push(iterator.device_id);
      }
      return singleControlDevices;

    }).catch(() => {
      const err = ErrorCodes['420004'];
      throw err;
    });

    const promiseList = [];
    for (const iterator of singleControlDevices) {
      if (singleControls.default_device_id != iterator) {
        const isToPublish = true;
        promiseList.push(await SchedulesService.deleteAllSchedules(iterator, company_id, user_id, occupant_id, isToPublish));
      }
    }
    await Promise.all(promiseList).then((result) => result).catch((err) => {
      throw err;
    });
    await database.single_control_devices.destroy({
      where: {
        single_control_id: id,
      },
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['420006'];
      throw err;
    });
    const deletedData = await database.single_controls.destroy({
      where: { id, company_id },
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['420007'];
      throw err;
    });
    const obj = {
      old: singleControls,
      new: {},
    };

    // creating reference in device rule_reference
    const deviceReferenceObj = await OneTouchRulesService.addDeviceReference(singleControls.gateway_id);
    if (!deviceReferenceObj) {
      const err = ErrorCodes['330005'];
      throw err;
    }
    const ref = deviceReferenceObj.id;
    const host = process.env.SERVICE_API_HOST || 'dev-service.ctiotsolution.com';
    const url = `https://${host}/api/v1/one_touch/gateway_rules?ref=${ref}`;
    await OneTouchRulesService.publishJsonUrl(company_id, gatewayExist.device_code, url);

    ActivityLogs.addActivityLog(Entities.single_controls.entity_name, Entities.single_controls.event_name.deleted,
      obj, Entities.notes.event_name.deleted, singleControls.gateway_id, company_id, user_id, occupant_id, null);
    return {
      message: 'Single control deleted successfully',
    };
  }

  static async getSingleControlDevices(device_id) {
    const getSingleControlDevices = await database.single_control_devices.findOne({
      where: { device_id },
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['420004'];
      throw err;
    });
    return getSingleControlDevices;
  }

  static async getSingleControlDevicesList(id) {
    const getSingleControlDevicesList = await database.single_control_devices.findAll({
      where: { single_control_id: id },
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['420004'];
      throw err;
    });
    return getSingleControlDevicesList;
  }
}

export default SingleControlsService;
