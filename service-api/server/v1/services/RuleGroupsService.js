import lodash from 'lodash';
import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import DeviceService from './DevicesService';

const { v4: uuidV4 } = require('uuid');
const moment = require('moment');

const { Op } = database.Sequelize;

class RuleGroupsService {
  static async getRuleGroups(id, company_id) {
    const ruleGroups = await database.rule_groups.findOne({
      include: [{ model: database.devices }],
      where: { id },
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['370001'];
      throw err;
    });

    if (ruleGroups && ruleGroups.device) {
      if (ruleGroups.device.rule_group_id == ruleGroups.id) {
        ruleGroups.dataValues.is_enable = true;
      } else {
        ruleGroups.dataValues.is_enable = false;
      }
      delete ruleGroups.dataValues.device;
    }
    return ruleGroups;
  }

  static async getAllRuleGroups(gateway_id, company_id, networkwifimac, occupant_id, user_id, gateway_code) {
    let where = {};
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
      raw: true,
    });
    if (!gatewayExist) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    if (!user_id && occupant_id) {
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
    }
    const getAllRuleGroups = await database.rule_groups.findAll({
      include: [{ model: database.devices }],
      where: { gateway_id: gatewayExist.id },
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const list = [];
      for (const element of result) {
        if (element && element.device) {
          if (element.device.rule_group_id == element.id) {
            element.dataValues.is_enable = true;
          } else {
            element.dataValues.is_enable = false;
          }
        }
        delete element.dataValues.device;
        list.push(element);
      }
      return list;
    }).catch(() => {
      const err = ErrorCodes['370001'];
      throw err;
    });
    return getAllRuleGroups;
  }

  static async addRuleGroups(name, icon, rules, gateway_id, company_id, user_id, occupant_id, is_enable) {
    // check valid gateway_id
    const gatewayExist = await database.devices.findOne({
      where: { id: gateway_id },
      raw: true,
    }).catch((err) => { });
    if (!gatewayExist) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    if (!user_id) {
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
    }
    const nameExist = await database.rule_groups.findOne({
      where: { name, gateway_id },
      raw: true,
    }).catch((err) => {
      throw err;
    });
    if (nameExist) {
      const err = ErrorCodes['370008'];
      throw err;
    }
    const addRuleGroups = await database.rule_groups.create({
      name, icon, rules: (rules) ? rules : [], gateway_id, company_id, key: uuidV4(),
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['370003'];
      throw err;
    });
    const Obj = {
      old: {},
      new: addRuleGroups,
    };
    if (is_enable) {
      const device = await database.devices.findOne({
        where:
          { id: gateway_id },
      }).catch((error) => {
        const err = ErrorCodes['370006'];
        throw err;
      });
      if (is_enable === true) {
        await database.devices.update({ rule_group_id: addRuleGroups.id }, {
          where:
            { id: gateway_id },
        }).then((result) => {
          const obj = {
            new: { rule_group_id: addRuleGroups.id },
            old: { rule_group_id: device.rule_group_id },
          };
          ActivityLogs.addActivityLog(Entities.rule_groups.entity_name, Entities.rule_groups.event_name.enabled,
            obj, Entities.notes.event_name.updated, addRuleGroups.id, company_id, user_id, occupant_id, null);
          ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.updated,
            obj, Entities.notes.event_name.updated, gateway_id, company_id, user_id, occupant_id, null);
        }).catch((error) => {
          const err = ErrorCodes['370006'];
          throw err;
        });
        //  publish setTriggerRule logic
        const gatewayid = addRuleGroups.gateway_id;
        // make rule groups rules array 
        const ruleGroupsArrayKeys = lodash.map(addRuleGroups.rules, 'key');
        /// get the one touch rules of all the one touch connected to this gateway_id
        const gatewayOneTouchArray = await database.one_touch_rules.findAll({
          where: { gateway_id: gatewayid },
        }).then((result) => result).catch((error) => {
          const err = ErrorCodes['330003'];
          throw err;
        });
        const setTriggerRule = 'sRule:SetTriggerRule';
        let promiseList = []
        if (gatewayOneTouchArray && ruleGroupsArrayKeys && Object.keys(gatewayOneTouchArray).length > 0 && Object.keys(ruleGroupsArrayKeys).length > 0) {
          for (const ele in gatewayOneTouchArray) {
            const element = gatewayOneTouchArray[ele];
            // check key included in RGA
            if (ruleGroupsArrayKeys.includes(element.key)) {
              const ruleTriggerKey = element.rule_trigger_key;
              ////// publish 
              promiseList.push(await DeviceService.publishDeviceName(company_id, device.device_code, setTriggerRule, ruleTriggerKey));
            }
          }
          await Promise.all(promiseList).then((results) => {
            return (results);
          }).catch(error => {
            const err = ErrorCodes['800022'];
            throw err;
          });
        }
      } else if (is_enable === false && device.rule_group_id == addRuleGroups.id) {
        await database.devices.update({ rule_group_id: null }, {
          where:
          {
            id: gateway_id,
            rule_group_id: addRuleGroups.id,
          },
        }).then((result) => {
          const obj = {
            new: { rule_group_id: null },
            old: { rule_group_id: device.rule_group_id },
          };
          ActivityLogs.addActivityLog(Entities.rule_groups.entity_name, Entities.rule_groups.event_name.disabled,
            obj, Entities.notes.event_name.updated, body.id, company_id, user_id, occupant_id, null);
          ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.updated,
            obj, Entities.notes.event_name.updated, gateway_id, company_id, user_id, occupant_id, null);
        }).catch((error) => {
          const err = ErrorCodes['370007'];
          throw err;
        });
      }
    }
    if (addRuleGroups) {
      ActivityLogs.addActivityLog(Entities.rule_groups.entity_name, Entities.rule_groups.event_name.added,
        Obj, Entities.notes.event_name.added, addRuleGroups.id, company_id, user_id, occupant_id, null);
    }
    return addRuleGroups;
  }

  static async updateRuleGroups(body, user_id, occupant_id) {
    const oldObj = {};
    const newObj = {};
    const existingData = await this.getRuleGroups(body.id, body.company_id);
    let afterUpdate = null;
    if (!existingData) {
      const err = ErrorCodes['370002'];
      throw err;
    }
    const updateObj = {};
    if (body.name) {
      const nameExist = await database.rule_groups.findOne({
        where: {
          name: body.name, gateway_id: existingData.gateway_id, id: {
            [Op.ne]: existingData.id
          }
        },
        raw: true,
      }).catch((err) => { });
      if (nameExist) {
        const err = ErrorCodes['370008'];
        throw err;
      }
      updateObj.name = body.name;
    }
    if (body.icon) {
      updateObj.icon = body.icon;
    }
    if (body.rules) {
      updateObj.rules = body.rules;
    }

    if (body.hasOwnProperty('is_enable')) {
      updateObj.is_enable = body.is_enable;
      const device = await database.devices.findOne({
        where:
          { id: existingData.gateway_id },
      }).catch((error) => {
        const err = ErrorCodes['370006'];
        throw err;
      });
      if (body.is_enable === true) {
        await database.devices.update({ rule_group_id: body.id }, {
          where:
            { id: existingData.gateway_id },
        }).then((result) => {
          const obj = {
            new: { rule_group_id: body.id },
            old: { rule_group_id: device.rule_group_id },
          };
          ActivityLogs.addActivityLog(Entities.rule_groups.entity_name, Entities.rule_groups.event_name.enabled,
            obj, Entities.notes.event_name.updated, body.id, body.company_id, user_id, occupant_id, null);
          ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.updated,
            obj, Entities.notes.event_name.updated, existingData.gateway_id, body.company_id, user_id, occupant_id, null);
        }).catch((error) => {
          const err = ErrorCodes['370006'];
          throw err;
        });

        //  publish setTriggerRule logic
        const gatewayid = existingData.gateway_id;
        // make rule groups rules array
        const ruleGroupsArrayKeys = lodash.map(existingData.rules, 'key');
        /// get the one touch rules of all the one touch connected to this gateway_id
        const gatewayOneTouchArray = await database.one_touch_rules.findAll({
          where: { gateway_id: gatewayid },
        }).then((result) => result).catch((error) => {
          const err = ErrorCodes['330003'];
          throw err;
        });
        const setTriggerRule = 'sRule:SetTriggerRule';
        let promiseList = []
        if (gatewayOneTouchArray && ruleGroupsArrayKeys && Object.keys(gatewayOneTouchArray).length > 0 && Object.keys(ruleGroupsArrayKeys).length > 0) {
          for (const ele in gatewayOneTouchArray) {
            const element = gatewayOneTouchArray[ele];
            // check key included in RGA
            if (ruleGroupsArrayKeys.includes(element.key)) {
              const ruleTriggerKey = element.rule_trigger_key;
              ////// publish 
              promiseList.push(await DeviceService.publishDeviceName(company_id, device.device_code, setTriggerRule, ruleTriggerKey));
            }
          }
          await Promise.all(promiseList).then((results) => {
            return (results);
          }).catch(error => {
            const err = ErrorCodes['800022'];
            throw err;
          });
        }
      } else if (body.is_enable === false && device.rule_group_id == body.id) {
        await database.devices.update({ rule_group_id: null }, {
          where:
          {
            id: existingData.gateway_id,
            rule_group_id: body.id,
          },
        }).then((result) => {
          const obj = {
            new: { rule_group_id: null },
            old: { rule_group_id: device.rule_group_id },
          };
          ActivityLogs.addActivityLog(Entities.rule_groups.entity_name, Entities.rule_groups.event_name.disabled,
            obj, Entities.notes.event_name.updated, body.id, body.company_id, user_id, occupant_id, null);
          ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.updated,
            obj, Entities.notes.event_name.updated, existingData.gateway_id, body.company_id, user_id, occupant_id, null);
        }).catch((error) => {
          const err = ErrorCodes['370007'];
          throw err;
        });
      }
    }

    if (Object.keys(updateObj).length > 0) {
      const updatedData = await database.rule_groups.update(updateObj, {
        where: {
          id: body.id,
          company_id: body.company_id,
        },
        returning: true,
        raw: true,
      }).then((result) => result).catch((error) => {
        const err = ErrorCodes['370004'];
        throw err;
      });

      afterUpdate = await this.getRuleGroups(body.id, body.company_id).then((result) => result).catch((error) => {
        const err = ErrorCodes['370002'];
        throw err;
      });
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
      const deletedExistingData = existingData.dataValues;
      delete deletedExistingData.updated_at;
      const deletedAfterUpdate = afterUpdate.dataValues;
      delete deletedAfterUpdate.updated_at;
      if (JSON.stringify(deletedExistingData) !== JSON.stringify(deletedAfterUpdate)) {
        ActivityLogs.addActivityLog(Entities.rule_groups.entity_name, Entities.rule_groups.event_name.updated,
          obj, Entities.notes.event_name.updated, existingData.id, body.company_id, user_id, occupant_id, null);
      }
      return afterUpdate;
    }
    return existingData;
  }

  static async deleteRuleGroups(id, company_id, user_id, occupant_id) {
    const deleteRuleGroups = await database.rule_groups.findOne({
      where: { id },
    });
    if (!deleteRuleGroups) {
      const err = ErrorCodes['370002'];
      throw err;
    }
    const findGatewayForRuleGroups = await database.devices.findOne({
      where: {
        rule_group_id: id,
        id: deleteRuleGroups.gateway_id,
      },
    });
    if (findGatewayForRuleGroups) {
      await database.devices.update(
        { rule_group_id: null }, {
        where: {
          id: deleteRuleGroups.gateway_id,
        },
      },
      ).then((result) => {
        const obj = {
          new: { rule_group_id: null },
          old: { rule_group_id: id },
        };
        ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.updated,
          obj, Entities.notes.event_name.updated, deleteRuleGroups.gateway_id, company_id, user_id, occupant_id, null);
      }).catch((error) => {
        const err = ErrorCodes['370004'];
        throw err;
      });
    }
    const deletedData = await database.rule_groups.destroy({
      where: { id },
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['370005'];
      throw err;
    });
    const obj = {
      old: deleteRuleGroups,
      new: {},
    };
    ActivityLogs.addActivityLog(Entities.rule_groups.entity_name, Entities.rule_groups.event_name.deleted,
      obj, Entities.notes.event_name.deleted, deleteRuleGroups.gateway_id, company_id, user_id, occupant_id, null);
    return deletedData;
  }
}

export default RuleGroupsService;
