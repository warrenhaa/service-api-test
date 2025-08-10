import { Op } from 'sequelize';
import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import OccupantsDashboardAttributesService from './OccupantsDashboardAttributesService';
import OccupantService from './OccupantService';

const mudder = require('mudder'); // only in Node
const lodash = require('lodash');
const Logger = require('../../utils/Logger');
const moment = require('moment');

class OccupantsGroupsService {
  static async getOccupantGroupsList(occupantId, companyId) {
    const linkedCompanies = await OccupantService.getlinkedCompanies(companyId)
    .catch((error) => {
      throw (error);
    }); 
    const getOccupantsGroups = await database.occupants_groups.findAll({
      include: [{
        attributes: ['id', 'device_id', 'occupant_group_id'],
        model: database.occupants_groups_devices,
        include: [{
          attributes: ['id', 'device_code', 'name', 'model'],
          model: database.devices,
        }],
      }],
      where: {
        occupant_id: occupantId,
        company_id: { [Op.in]: linkedCompanies },
      },
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160029'];
      throw err;
    });

    return getOccupantsGroups;
  }

  static async getOccupantGroup(id, occupant_id, company_id) {
    const linkedCompanies = await OccupantService.getlinkedCompanies(company_id)
    .catch((error) => {
      throw (error);
    }); 
    const group = await database.occupants_groups.findOne({
      attributes: ['id', 'name'],
      include: [
        {
          attributes: ['id'],
          required: false,
          model: database.occupants_groups_devices,
          include: [{
            attributes: ['id', 'device_code', 'name', 'model'],
            model: database.devices,
            include: [{
              required: false,
              attributes: ['name', 'category_id'],
              model: database.categories,
              as: 'category',
            }, {
              required: false,
              attributes: ['id', 'type', 'grid_order'],
              model: database.occupants_dashboard_attributes,
              where: {
                occupant_id,
              },
              as: 'dashboard_attributes',
            }, {
              required: false,
              model: database.alert_communication_configs,
              where: {
                occupant_id,
              },
            }],
            where: {
              is_manually_added: true,
            },
          }],
          as: 'devices',
        },
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
          },
          as: 'dashboard_attributes',
        },
      ],
      where: {
        occupant_id, id, company_id: { [Op.in]: linkedCompanies },
      },
    }).then((group) => {
      if (!group) {
        return {};
      }
      const obj = group.dataValues;
      if (group.devices) {
        if (!obj.dashboard_attributes) {
          obj.dashboard_attributes = {
            type: 'group',
          };
        }
        obj.items = [];
        for (const element of group.devices) {
          const deviceObj = element.device.dataValues;
          deviceObj.group_device_id = element.id;
          // deviceObj.dashboard_attributes = element.dashboard_attributes;
          if (!deviceObj.dashboard_attributes) {
            deviceObj.dashboard_attributes = {
              type: 'device',
            };
          }
          obj.items.push(deviceObj);
        }
      }
      delete obj.devices;
      return obj;
    }).catch((err) => { });
    return group;
  }

  static async checkGateway(id) {
    const checkGateway = await database.devices.findOne({
      where: {
        id,
        type: 'gateway',
        is_manually_added: true,
      },
      raw: true,
    }).then((result) => result);
    if (!checkGateway) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    return checkGateway;
  }

  static async getRandomGridOrder() {
    const hexstrings = mudder.base62.mudder('0', 'z', 10000);
    const random = Math.floor(Math.random() * hexstrings.length);
    return hexstrings[random];
  }

  static async addOccupantGroup(body, occupantId, deviceList) {
    if (body.type == 'location') {
      const location = await database.locations.findOne({
        where: {
          id: body.item_id,
        },
        raw: true,
      }).then((result) => result).catch((err) => {
        throw err;
      });
      if (!location) {
        const err = ErrorCodes['150003'];
        throw err;
      }
    }
    if (body.type == 'gateway') {
      const gateway = await database.devices.findOne({
        where: {
          id: body.item_id,
        },
        raw: true,
      }).then((result) => result).catch((err) => {
        throw err;
      });
      if (!gateway) {
        const err = ErrorCodes['800013'];
        throw err;
      }
      const isHavePermission = await database.occupants_permissions.findOne({
        where: {
          [Op.or]: [
            {
              receiver_occupant_id: occupantId,
              is_temp_access: false,
              gateway_id: gateway.id,
            },
            {
              receiver_occupant_id: occupantId,
              end_time: {
                [Op.gte]: moment().toDate(),
              },
              start_time: {
                [Op.lte]: moment().toDate(),
              },
              is_temp_access: true,
              gateway_id: gateway.id,
            }],
        },
      });
      if (!isHavePermission) {
        const err = ErrorCodes['160045'];
        throw err;
      }
    }
    const group = await database.occupants_groups.findOne({
      where: {
        name: body.name,
        occupant_id: occupantId,
        type: body.type,
      },
    }).catch(() => {
      const err = ErrorCodes['160029'];
      throw err;
    });
    if (group) { 
      const err = ErrorCodes['160062'];
      throw err;
    }
    const addoccupantGroups = await database.occupants_groups.create({
      occupant_id: occupantId,
      item_id: body.item_id,
      name: body.name,
      type: body.type,
      company_id: body.company_id,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160031'];
      throw err;
    });
    const Obj = {
      old: {},
      new: addoccupantGroups,
    };
    const occupantGroupId = addoccupantGroups.id;
    if (addoccupantGroups) {
      ActivityLogs.addActivityLog(Entities.occupants_groups.entity_name,
        Entities.occupants_groups.event_name.added,
        Obj, Entities.notes.event_name.added, occupantId,
        body.company_id, null, occupantId, null);

      let grid_order = null;
      if (body.grid_order) {
        grid_order = body.grid_order;
        const input = {
          item_id: occupantGroupId,
          type: 'group',
          grid_order,
        };
        await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(input,
          body.company_id, occupantId);
      }
      if (deviceList.length > 0) {
        await this.addOccupantGroupDevices(occupantGroupId, deviceList, occupantId,
          body.company_id, body.type);
      }
    }
    const occupantGroup = await this.getOccupantGroup(occupantGroupId, occupantId, body.company_id);
    return occupantGroup;
  }

  static async addOccupantGroupsDevices(occupantGroupId, deviceList, occupantId, companyId, type) {
    const linkedCompanies = await OccupantService.getlinkedCompanies(companyId)
    .catch((error) => {
      throw (error);
    }); 
    // deviceList.forEach(async (deviceId) => {
    for (const deviceId of deviceList) {
      const checkdevice = await database.devices.findOne({
        where: {
          id: deviceId,
          is_manually_added: true,
        },
        raw: true,
      }).then((result) => result).catch((err) => {
        Logger.error('Error! devices not found in devices table', {
          error_message: err,
          device_id: deviceId,
        });
      });
      if (checkdevice) {
        const groupDevices = await database.occupants_groups_devices.findAll({
          include:
            [{
              model: database.occupants_groups,
              where: {
                occupant_id: occupantId,
                company_id: { [Op.in]: linkedCompanies },
              },
            }],
        }).then((result) => {
          if (!result || result.length == 0) {
            return [];
          }
          const groupedDeviceList = [];
          for (const iterator of result) {
            groupedDeviceList.push(iterator.device_id);
          }
          return groupedDeviceList;
        }).catch((err) => {
          throw err;
        });
        if (groupDevices.includes(deviceId)) {
          console.log('Error! This device is already present in group devices', { device_id: deviceId });
        }
        const occupantGroupsDevices = await database.occupants_groups_devices.create({
          occupant_group_id: occupantGroupId,
          device_id: deviceId,
        }).then((result) => result).catch((err) => {
          Logger.error('Error! This device is not added to the occupant_groups_devices table', {
            error_message: err,
            device_id: deviceId,
          });
        });

        const Obj = {
          old: {},
          new: occupantGroupsDevices,
        };
        ActivityLogs.addActivityLog(Entities.occupants_groups_devices.entity_name,
          Entities.occupants_groups_devices.event_name.added,
          Obj, Entities.notes.event_name.added, occupantId,
          companyId, null, occupantId, null);
        const body = {
          item_id: deviceId,
          type: 'device',
          grid_order: await this.getRandomGridOrder(),
        };
        await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(body,
          companyId, occupantId);
      } else {
        Logger.error('Error! This device is not present in device table', { device_id: deviceId });
      }
    }
    return null;
  }

  static async occupantGroup(id, occupantId, companyId) {
    const linkedCompanies = await OccupantService.getlinkedCompanies(companyId)
    .catch((error) => {
      throw (error);
    }); 
    const occupantGroups = await database.occupants_groups.findOne({
      where: {
        id,
        occupant_id: occupantId,
        company_id: { [Op.in]: linkedCompanies },
      },
      raw: true,
    }).then((result) => result);
    if (!occupantGroups) {
      const err = ErrorCodes['160029'];
      throw err;
    }
    return occupantGroups;
  }

  static async updateOccupantsGroup(id, body, occupantId, companyId) {
    const oldObj = {};
    const newObj = {};
    const linkedCompanies = await OccupantService.getlinkedCompanies(companyId)
    .catch((error) => {
      throw (error);
    }); 
    const existingData = await this.occupantGroup(id, occupantId, companyId);
    let afterUpdate = null;
    if (existingData) {
      const group = await database.occupants_groups.findOne({
        where: {
          name: body.name,
          occupant_id: occupantId,
          type: existingData.type,
          id: {
            [Op.ne]: id,
          }
        },
      }).catch(() => {
        const err = ErrorCodes['160029'];
        throw err;
      });
      if (group) {
        const err = ErrorCodes['160062'];
        throw err;
      }
      await database.occupants_groups.update({ name: body.name }, {
        where: {
          id,
          occupant_id: occupantId,
        },
        returning: true,
        raw: true,
      }).then((result) => result).catch(() => {
        const err = ErrorCodes['160030'];
        throw err;
      });

      // grid order
      let grid_order = null;
      if (body.grid_order) {
        grid_order = body.grid_order;
        const input = {
          item_id: id,
          type: 'group',
          grid_order,
        };
        await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(input,
          body.company_id, occupantId).catch((err) => { throw err; });
      } else {
        const dashboardAttributes = await database.occupants_dashboard_attributes.findOne({
          where: { item_id: id, occupant_id: occupantId },
        }).catch((error) => {
          const err = ErrorCodes['160025'];
          throw err;
        });
        if (dashboardAttributes) {
          await OccupantsDashboardAttributesService.deleteOccupantsDashboardAttributes(dashboardAttributes.id, occupantId, body.company_id).catch((err) => {
            throw err;
          });
        }
      }

      afterUpdate = await this.occupantGroup(id, occupantId, companyId);
      Object.keys(body).forEach((key) => {
        if (JSON.stringify(existingData[key]) !== JSON.stringify(body[key])) {
          oldObj[key] = existingData[key];
          newObj[key] = body[key];
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
        ActivityLogs.addActivityLog(Entities.occupants_groups.entity_name,
          Entities.occupants_groups.event_name.updated,
          obj, Entities.notes.event_name.updated, occupantId, companyId, null, occupantId, null);
      }
      if (body.devices && body.devices.length > 0) {
        const groupDevices = await database.occupants_groups_devices.findAll({
          include:
            [{
              model: database.occupants_groups,
              where: {
                occupant_id: occupantId,
                company_id: { [Op.in]: linkedCompanies },
              },
            }],
        }).then((result) => {
          if (!result || result.length == 0) {
            return [];
          }
          const groupedDeviceList = [];
          for (const iterator of result) {
            groupedDeviceList.push(iterator.device_id);
          }
          return groupedDeviceList;
        }).catch((err) => {
          console.log(err);
          throw err;
        });
        const newDeviceList = groupDevices.filter((element) => !body.devices.includes(element))
          .concat(body.devices.filter((element) => !groupDevices.includes(element)));
        const addGroupDeviceList = [];
        const deleteGroupDeviceList = [];
        for (const deviceId of newDeviceList) {
          const groupDevice = await database.occupants_groups_devices.findOne({
            where: {
              occupant_group_id: id,
              device_id: deviceId,
            },
          });
          if (groupDevice) {
            deleteGroupDeviceList.push(groupDevice.device_id);
          } else {
            addGroupDeviceList.push(deviceId);
          }
        }
        if (addGroupDeviceList.length > 0) {
          await this.addOccupantGroupDevices(id, addGroupDeviceList, occupantId, companyId);
        }

        if (deleteGroupDeviceList.length > 0) {
          await this.deleteOccupantGroupDevices(id, deleteGroupDeviceList, occupantId, companyId);
        }
      }
      const occupantGroup = await this.getOccupantGroup(id, occupantId, companyId);
      return occupantGroup;
    }

    return null;
  }

  static async addOccupantGroupDevices(occupantGroupId, deviceList, occupantId, companyId) {
    const linkedCompanies = await OccupantService.getlinkedCompanies(companyId)
    .catch((error) => {
      throw (error);
    }); 
    const checkGroup = await database.occupants_groups.findOne({
      where: {
        id: occupantGroupId,
      },
    }).catch((error) => {
      const err = ErrorCodes['160029'];
      throw err;
    });
    if (!checkGroup) {
      const err = ErrorCodes['160029'];
      throw err;
    }
    if (deviceList.length > 0) {
      for (const deviceId of deviceList) {
        const checkdevice = await database.devices.findOne({
          where: {
            id: deviceId,
          },
          raw: true,
        }).then((result) => result)
          .catch((err) => {
            Logger.error('Error! devices not found in devices table', {
              error_message: err,
              device_id: deviceId,
            });
            console.log(err);
            throw err;
          });

        if (checkdevice) {
          const groupDevices = await database.occupants_groups_devices.findAll({
            include:
              [{
                model: database.occupants_groups,
                where: {
                  occupant_id: occupantId,
                  company_id: { [Op.in]: linkedCompanies },
                },
              }],
          }).then((result) => {
            if (!result || result.length == 0) {
              return [];
            }
            const groupedDeviceList = [];
            for (const iterator of result) {
              groupedDeviceList.push(iterator.device_id);
            }
            return groupedDeviceList;
          }).catch((err) => {
            console.log(err);
            throw err;
          });
          if (groupDevices.includes(deviceId)) {
          } else {
            const occupantGroupsDevices = await database.occupants_groups_devices.create({
              occupant_group_id: occupantGroupId,
              device_id: deviceId,
            }).then((result) => result).catch((err) => {
              Logger.error('Error! This device is not added to the occupant_groups_devices table', {
                error_message: err,
                device_id: deviceId,
              });
              console.log(err);
              throw err;
            });

            const Obj = {
              old: {},
              new: occupantGroupsDevices,
            };
            ActivityLogs.addActivityLog(Entities.occupants_groups_devices.entity_name,
              Entities.occupants_groups_devices.event_name.added,
              Obj, Entities.notes.event_name.added, occupantId,
              companyId, null, occupantId, null);
            // const body = {
            //   item_id: deviceId,
            //   type: 'device',
            //   grid_order: await this.getRandomGridOrder(),
            // };
            // await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(body,
            //   companyId, occupantId);
          }
        } else {
          Logger.error('Error! This device is not present in device table', { device_id: deviceId });
        }
      }
    } else {
      return null;
    }
    const occupantGroup = await this.getOccupantGroup(occupantGroupId, occupantId, companyId);
    return occupantGroup;
  }

  static async deleteOccupantGroupDevices(occupantGroupId, deviceList, occupantId, companyId) {
    const checkGroup = await database.occupants_groups.findOne({
      where: {
        id: occupantGroupId,
      },
    }).catch((error) => {
      const err = ErrorCodes['160029'];
      throw err;
    });
    if (!checkGroup) {
      const err = ErrorCodes['160029'];
      throw err;
    }
    if (deviceList.length > 0) {
      for (const deviceId of deviceList) {
        const checkdevice = await database.devices.findOne({
          where: {
            id: deviceId,
            is_manually_added: true,
          },
          raw: true,
        }).then((result) => result).catch((error) => {
          Logger.error('Error! devices not found in devices table', {
            error_message: error,
            device_id: deviceId,
          });
          console.log(error);
          const err = ErrorCodes['160029'];
          throw err;
        });
        if (checkdevice) {
          // checking the device whether its present in the occupants_groups_devices table or not
          const addoccupantGroupsDevices = await database.occupants_groups_devices.findOne({
            where: {
              occupant_group_id: occupantGroupId,
              device_id: deviceId,
            },
          }).then((result) => result).catch((err) => {
            Logger.error('Error! devices not found in occupant_groups_devices table', {
              error_message: err,
              device_id: deviceId,
              occupant_group_id: occupantGroupId,
            });
            throw err;
          });
          // if device is not there in the occupants_groups_devices table then create the new record
          // and if it is present then destroy the record
          if (!addoccupantGroupsDevices) {
            Logger.error('Error! ,This device is not present in group devices to delete', { device_id: deviceId });
          } else {
            await database.occupants_groups_devices.destroy({
              where: {
                occupant_group_id: occupantGroupId,
                device_id: deviceId,
              },
            }).catch((err) => {
              Logger.error('Error! This device is not deleted from the occupant_groups_devices table', { error_message: err });
            });
            const Obj = {
              old: addoccupantGroupsDevices,
              new: {},
            };
            ActivityLogs.addActivityLog(Entities.occupants_groups_devices.entity_name,
              Entities.occupants_groups_devices.event_name.deleted,
              Obj, Entities.notes.event_name.deleted, occupantId,
              companyId, null, occupantId, null);
          }
        } else {
          Logger.error('Error! This device is not present in device table', { device_id: deviceId });
        }
      }
    } else {
      return null;
    }
    const occupantGroup = await this.getOccupantGroup(occupantGroupId, occupantId, companyId);
    return occupantGroup;
  }

  static async deleteOccupantGroup(id, occupantId, companyId) {
    const deleteOccupantsGroups = await database.occupants_groups.findOne({
      where: {
        id,
        occupant_id: occupantId,
      },
    });
    if (!deleteOccupantsGroups) {
      const err = ErrorCodes['160030'];
      throw err;
    }
    // delete dashboard attribute
    const dashboardAttribute = await database.occupants_dashboard_attributes.findOne({
      where: {
        item_id: id,
      },
    });
    if (dashboardAttribute && dashboardAttribute.id) {
      await OccupantsDashboardAttributesService.deleteOccupantsDashboardAttributes(dashboardAttribute.id, occupantId, companyId).catch((err) => {
        Logger.error('error', err);
        // throw err;
      });
    }

    // occupantGroupId, deviceList, occupantId, companyId
    const devices = await database.occupants_groups_devices.findAll({
      where: {
        occupant_group_id: id,
      },
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160033'];
      throw err;
    });
    const deviceList = lodash.map(devices, (ele) => ele.device_id);

    if (deviceList && deviceList.length > 0) {
      await this.deleteOccupantGroupDevices(id, deviceList, occupantId, companyId).catch((error) => { const err = ErrorCodes['160033']; throw err; });
    }
    const deletedData = await database.occupants_groups.destroy({
      where: {
        id,
        occupant_id: occupantId,
      },
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160033'];
      throw err;
    });

    const obj = {
      old: deleteOccupantsGroups,
      new: {},
    };
    ActivityLogs.addActivityLog(Entities.occupants_groups.entity_name,
      Entities.occupants_groups.event_name.deleted,
      obj, Entities.notes.event_name.deleted, occupantId, companyId, null, occupantId, null);
    return deletedData;
  }

  static async getGatewayGroups(gateway_id, occupant_id) { 
    const isHavePermission = await database.occupants_permissions.findOne({
      where: {
        [Op.or]: [
          {
            receiver_occupant_id: occupant_id,
            is_temp_access: false,
            gateway_id,
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
            gateway_id,
          }],
      },
    });
    if (!isHavePermission) {
      const err = ErrorCodes['160045'];
      throw err;
    }
    const groups = await database.occupants_groups.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          attributes: ['id'],
          required: false,
          model: database.occupants_groups_devices,
          include: [{
            attributes: ['id', 'device_code', 'name', 'model'],
            model: database.devices,
            include: [{
              required: false,
              attributes: ['name', 'category_id'],
              model: database.categories,
              as: 'category',
            }, {
              required: false,
              attributes: ['id', 'type', 'grid_order'],
              model: database.occupants_dashboard_attributes,
              where: {
                occupant_id,
              },
              as: 'dashboard_attributes',
            }, {
              required: false,
              model: database.alert_communication_configs,
              where: {
                occupant_id,
              },
            }],
            where: {
              is_manually_added: true,
            },
          }],
          as: 'devices',
        },
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
          },
          as: 'dashboard_attributes',
        },
      ],
      where: {
        occupant_id, item_id: gateway_id,
      },
      order: [['name', 'ASC']],
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const formatedGroups = [];
      for (const group of result) {
        const obj = group.dataValues;
        if (group.devices) {
          obj.items = [];
          for (const element of group.devices) {
            const deviceObj = element.device.dataValues;
            deviceObj.group_device_id = element.id;
            // deviceObj.dashboard_attributes = element.dashboard_attributes;
            if (!deviceObj.dashboard_attributes) {
              deviceObj.dashboard_attributes = {
                type: 'device',
              };
            }
            obj.items.push(deviceObj);
          }
        }
        delete obj.devices;
        formatedGroups.push(obj);
      }
      return formatedGroups;
    }).catch((err) => { console.log(err); });
    return groups;
  }

  static async getLocationGroups(occupant_location_id, occupant_id, userid) {
    const sharedDeviceList = await OccupantService.sharedDeviceList(userid);
    const groups = await database.occupants_groups.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          attributes: ['id'],
          required: true,
          model: database.occupants_groups_devices,
          include: [{
            attributes: ['id', 'device_code', 'name', 'model'],
            model: database.devices,
            include: [{
              required: false,
              attributes: ['name', 'category_id'],
              model: database.categories,
              as: 'category',
            }, {
              required: false,
              attributes: ['id', 'type', 'grid_order'],
              model: database.occupants_dashboard_attributes,
              where: {
                occupant_id,
              },
              as: 'dashboard_attributes',
            }, {
              required: false,
              model: database.alert_communication_configs,
              where: {
                occupant_id,
              },
            }],
            where: {
              device_code: { [Op.in]: sharedDeviceList },
            },
          }],
          as: 'devices',
        },
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
          },
          as: 'dashboard_attributes',
        },
      ],
      where: {
        occupant_id, item_id: occupant_location_id,
      },
      order: [['name', 'ASC']],
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const formatedLocations = [];
      for (const group of result) {
        const obj = group.dataValues;
        if (group.devices) {
          obj.items = [];
          for (const element of group.devices) {
            const deviceObj = element.device.dataValues;
            deviceObj.group_device_id = element.id;
            // deviceObj.dashboard_attributes = element.dashboard_attributes;
            if (!deviceObj.dashboard_attributes) {
              deviceObj.dashboard_attributes = {
                type: 'device',
              };
            }
            obj.items.push(deviceObj);
          }
        }
        delete obj.devices;
        formatedLocations.push(obj);
      }
      return formatedLocations;
    }).catch((err) => { });

    return groups;
  }
}

export default OccupantsGroupsService;
