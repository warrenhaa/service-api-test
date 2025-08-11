import { result } from 'lodash';
import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import communicateWithAwsIotService from './CommunicateWithAwsIotService';
import OccupantsDashboardAttributesService from './OccupantsDashboardAttributesService';
import Responses from '../../utils/constants/Responses';
import OneTouchCommunicationConfigService from './OneTouchCommunicationConfigService';
import OneTouchCbCommunicationConfigService from './OneTouchCbCommunicationConfigService';
import RuleGroupsService from './RuleGroupsService';
import occupantDashboardService  from './OccupantDashboardService'

const mustache = require('mustache');
const moment = require('moment');

const { Op } = database.Sequelize;
const lodash = require('lodash');

class OneTouchRulesService {
  static async publishJsonRuleUrl(gateway_id, gateway_code, company_id) {
    const oneTouchReferenceObj = await OneTouchRulesService.addDeviceReference(gateway_id);
    if (!oneTouchReferenceObj) {
      const err = ErrorCodes['470001'];
      throw err;
    }
    const ref = oneTouchReferenceObj.id;
    const host = process.env.SERVICE_API_HOST;
    const url = `https://${host}/api/v2/one_touch/gateway_rules?ref=${ref}`;
    // creates a json object
    await this.publishJsonUrl(company_id, gateway_code, url).catch((error) => {
      const err = ErrorCodes['330005'];
      throw err;
    });
  }

  static async sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  static async checkJsonUrl(gateway_code, company_id, tryCount, url) {
    return new Promise(async (resolve, reject) => {
      const params = {
        thingName: gateway_code,
      };
      const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
      if (!shadowData) {
        // gateway shadow not updated
        const err = ErrorCodes['330005'];
        throw err;
      }
      const payload = JSON.parse(shadowData.payload);
      let jsonURL = false;
      const { reported } = payload.state; // array
      Object.keys(reported).forEach((key) => {
        if (reported[key].hasOwnProperty('properties')) {
          const { properties } = reported[key];
          const URL = Object.keys(properties).filter((name) => name.endsWith(':sRule:JsonURL'));
          if (URL && URL.length > 0) {
            const value = properties[URL[0]];
            if (value.includes(url)) {
              jsonURL = true;
            }
          }
        }
      });

      if (jsonURL === false && tryCount <= 5) {
        await this.sleep(3000);
        tryCount += 1;
        await this.checkJsonUrl(gateway_code, company_id, tryCount, url).then(() => {
          resolve();
        }).catch((err) => {
          reject(err);
        });
      } else {
        resolve();
      }
    });
  }

  static async publishJsonUrl(company_id, gateway_code, url, is_validate_url) {
    if (is_validate_url == undefined || is_validate_url == null) {
      is_validate_url = true
    }
    var params = {
      thingName: gateway_code,
    };
    const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
    if (!shadowData) {
      // gateway shadow not updated
      const err = ErrorCodes['330005'];
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
      const err = ErrorCodes['330005'];
      throw err;
    }
    const baseSplitArray = base.split(':');
    const setJsonUrl = `${baseSplitArray[0]}:sRule:SetJsonURL`;
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
    payload.state.desired[base_key].properties[setJsonUrl] = url;
    const topic = `$aws/things/${gateway_code}/shadow/update`;
    var params = {
      topic,
      payload: JSON.stringify(payload),
    };
    const publishShadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'publish').then((data) => data);
    if (!publishShadowData) {
      const err = ErrorCodes['330005']; // not published the url
      throw err;
    }
    if (is_validate_url == true) {
      const tryCount = 0;
      await this.checkJsonUrl(gateway_code, company_id, tryCount, url).then((res) => res)
        .catch((error) => {
          const err = ErrorCodes['330005'];
          throw err;
        });
    }


    return { success: true };
  }

  static async addDeviceReference(device_id) {
    let data = null
    data = await this.getGatewayOneTouchRulesByDeviceId(device_id).catch((err) => {
      throw err;
    });
    const deviceReferenceObj = await database.device_references.create({
      device_id, data
    }).then((result) => result)
      .catch((error) => {
        const err = ErrorCodes['470001'];
        throw err;
      });

    return deviceReferenceObj;
  }

  static async addOneTouchRule(rule, rule_trigger_key, key, gateway_code, company_id, occupant_id,
    user_id, grid_order, communicationConfigs, name, keyList, cloudBridgeConfigs, source_IP,identity_id) {
    let rulesObject = rule;
    let cloudBridgeConfigsArray = cloudBridgeConfigs;
    const gateway = await database.devices.findOne({
      where: { device_code: gateway_code },
      raw: true,
    }).then((result) => result);
    if (!gateway) {
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
              gateway_id: gateway.id,
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
              gateway_id: gateway.id,
            }],
        },
      });
      if (!isHavePermission) {
        const err = ErrorCodes['160045'];
        throw err;
      }
    }
    if((process.env.ALLOW_WITHOUT_OCCUPANT == "true" || process.env.ALLOW_WITHOUT_OCCUPANT == true)&& identity_id){
      let userData = await occupantDashboardService.getUserData(identity_id)
      let gatewayIdList = [];
      if (userData && userData.Items && userData.Items.length > 0) {
        gatewayIdList = await occupantDashboardService.getGatewayIdList(userData) || [];
      }
      if(!gatewayIdList.includes(gateway_code)){
        const err = ErrorCodes['160045'];
        throw err;
      }
    }
    let where = {};
    let ruleTriggerKeyRecordExist = null;
    let keyRecordExist = null;
    // rule_trigger_key and key both are having unique constraint so check separately the record exists or not
    if (rule_trigger_key) {
      where = { rule_trigger_key };
      // check rule trigger key already exist or not.
      ruleTriggerKeyRecordExist = await database.one_touch_rules.findOne({
        where,
        raw: true,
      });
    }
    if (key) {
      where = { key };
      // check key record already exist or not.
      keyRecordExist = await database.one_touch_rules.findOne({
        where,
        raw: true,
      });
    }
    // check if any one record present then throw error - Record already exists
    if (keyRecordExist) {
      const err = ErrorCodes['330013'];
      throw err;
    }
    const oneTouchName = await database.one_touch_rules.findOne({
      where: {
        gateway_id: gateway.id,
        'rule.name': {
          $eq: name,
        },
        key: {
          [Op.notIn]: keyList,
        },
      },
      raw: true,
    });
    if (oneTouchName) {
      const err = ErrorCodes['160062'];
      throw err;
    }
    if (cloudBridgeConfigsArray && cloudBridgeConfigsArray.length > 0) {
      const cbCount = cloudBridgeConfigsArray.length;
      const oneTouchCbCommunicationConfigCount = await database.one_touch_cb_communication_configs.count({
        where: { gateway_code },
      }).then((result) => result)
        .catch(() => {
          const err = ErrorCodes['330017'];
          throw err;
        });
      if (oneTouchCbCommunicationConfigCount
        + cbCount < 129) {
        rulesObject = JSON.stringify(rulesObject);
        cloudBridgeConfigsArray = JSON.stringify(cloudBridgeConfigsArray);
        const oneTouchCbCommunicationConfig = await
          database.one_touch_cb_communication_configs.findAll({
            where: { gateway_code },
            raw: true,
          }).catch(() => {
            const err = ErrorCodes['330017'];
            throw err;
          });
        let arrayIds = [];
        arrayIds = lodash.map(oneTouchCbCommunicationConfig, 'array_id');
        let newArray = []
        if (arrayIds.length > 0) {
          newArray = arrayIds.map((element) => {
            // Check if the element starts with 'i' and ends with 'd'
            if (/^i\d+d$/.test(element)) {
              // Extract the digit part and replace the element
              const digitPart = element.match(/\d+/)[0];
              return digitPart;
            }
            return element;
          });
        }
        // console.log("🚀 ~ file: OneTouchRulesService.js:231 ~ newArray:", newArray)

        const data = {};
        const ruleData = {}
        cloudBridgeConfigs.map(async (value, index) => {
          let arrayId = value.array_id;
          if (arrayId.includes('{')) {
            arrayId = arrayId.replace(/[{]/g, '');
            arrayId = arrayId.replace(/[}]/g, '');
          }
          const numberArray = Array.from({ length: 128 }, (_, ind) => ind + 1);
          //
          const stringArray = numberArray.map((number) => number.toString());
          const uncommonNumbers = newArray.concat(stringArray)
            .filter((number) => !newArray.includes(number) || !stringArray.includes(number));
          newArray.push(uncommonNumbers[0])
          if (arrayId.includes('Action')) {
            data[`${arrayId}`] = uncommonNumbers[0];
            ruleData[`${arrayId}`] = parseInt(uncommonNumbers[0]);
            const variablesToReplace = [arrayId];
            const pattern = new RegExp(`"{{(${variablesToReplace.join('|')})}}"`, 'g');
            rulesObject = rulesObject.replace(pattern, '{{$1}}');
          } else {
            data[`${arrayId}`] = `i${uncommonNumbers[0]}d`
            ruleData[`${arrayId}`] = `i${uncommonNumbers[0]}d`
          }
        });

        // console.log("🚀 ~ file: OneTouchRulesService.js:247 ~ cloudBridgeConfigs.map ~ data:", data)

        const renderedRuleString = mustache.render(rulesObject, ruleData);
        const renderedCbConfigString = mustache.render(cloudBridgeConfigsArray, data);
        rulesObject = JSON.parse(renderedRuleString);
        cloudBridgeConfigsArray = JSON.parse(renderedCbConfigString);
      } else {
        const err = ErrorCodes['330020'];
        throw err;
      }
    }
    const oneTouchRuleObj = await database.one_touch_rules.create({
      rule: rulesObject, rule_trigger_key, key, gateway_id: gateway.id, company_id,
    }).catch((error) => {
      const err = ErrorCodes['330000'];
      throw err;
    });

    if (!oneTouchRuleObj) {
      const err = ErrorCodes['330000'];
      throw err;
    }
    // creeting reference in one_touch_rule_reference
    let communicationConfigsObj = null;
    if (communicationConfigs && communicationConfigs.length > 0) {
      for (const key in communicationConfigs) {
        const data = communicationConfigs[key];
        const { action_trigger_key } = data;
        const { emails } = data;
        const { phone_numbers } = data;
        let { message } = data;
        if (!message) {
          const oneTouchname = oneTouchRuleObj.rule.name
          message = `${oneTouchname} alert message`;
        }
        // check action trigger key already exist or not.
        const communicationRecordExist = await database.one_touch_communication_configs.findOne({
          where: { action_trigger_key },
          raw: true,
        });
        if (communicationRecordExist) {
          const err = ErrorCodes['330014'];
          throw err;
        }

        communicationConfigsObj = await OneTouchCommunicationConfigService.createOneTouchCommunicationConfigData(oneTouchRuleObj.id, action_trigger_key, emails, phone_numbers, message, company_id, occupant_id, source_IP)
          .catch((error) => {
            const err = ErrorCodes['330009'];
            throw err;
          });
      }
    }
    if (cloudBridgeConfigsArray && cloudBridgeConfigsArray.length > 0) {
      var promiseList = []
      for (const key in cloudBridgeConfigsArray) {
        const value = cloudBridgeConfigsArray[key];
        const {
          config_type, camera_id, array_id,
          property_name, property_value, ruleop, device_code,
        } = value;
        promiseList.push(await OneTouchCbCommunicationConfigService.addCbConfigs(gateway_code, config_type, camera_id, array_id, property_name,
          property_value, ruleop, device_code, occupant_id, company_id, user_id, oneTouchRuleObj.id, source_IP))


      }
      await Promise.all(promiseList).then((results) => results).catch((error) => {
        const err = ErrorCodes['330019'];
        throw err;
      });
    }
    // creates data to add in activitylog
    if (grid_order && occupant_id) {
      const input = {
        item_id: oneTouchRuleObj.id,
        type: 'one_touch_rule',
        grid_order,
      };
      await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(input,
        company_id, occupant_id, source_IP);
    }
    const obj = {
      new: oneTouchRuleObj,
      old: {},
    };
    const placeholdersData = {};
    ActivityLogs.addActivityLog(Entities.one_touch_rules.entity_name,
      Entities.one_touch_rules.event_name.added, obj, Entities.notes.event_name.added, oneTouchRuleObj.id,
      company_id, user_id, occupant_id, placeholdersData, source_IP);

    if (occupant_id) {
      const ruleObj = await this.getOneTouchRule(rule_trigger_key, key, occupant_id)
        .catch((err) => {
          throw err;
        });
      return ruleObj;
    } else {
      return oneTouchRuleObj;
    }
  }

  static async updateOneTouchRule(rule, rule_trigger_key, company_id, occupant_id, user_id,
    grid_order, communicationConfigs, key, name, keyList, cloudBridgeConfigs, source_IP,identity_id) {
    let afterUpdateOneTouchRule = null;
    const oneTouchRule = await this.getOneTouchRule(rule_trigger_key, key, occupant_id);
    let rulesObject = rule;
    let cloudBridgeConfigsArray = cloudBridgeConfigs;
    let uniqueExistedConfigs = [];
    let uniqueNewConfigs = [];
    let gateway = null;
    let rulesActionTriggerKeyList = [];
    const actionTriggerKeyList = [];
    if (!oneTouchRule) {
      const err = ErrorCodes['330002'];
      throw err;
    }
    let where = {};
    // if (rule_trigger_key) {
    //   where = {
    //     rule_trigger_key,
    //   };
    // } else if (key) {
    where = {
      key,
    };
    // }
    const oneTouchName = await database.one_touch_rules.findOne({
      where: {
        gateway_id: oneTouchRule.gateway_id,
        'rule.name': {
          $eq: name,
        },
        key: {
          [Op.notIn]: keyList,
        }
      },
      raw: true,
    });
    if (oneTouchName) {
      const err = ErrorCodes['160062'];
      throw err;
    }
    gateway = await database.devices.findOne({
      where: {
        id: oneTouchRule.gateway_id,
      },
    });
    if (!user_id && occupant_id) {
      const isHavePermission = await database.occupants_permissions.findOne({
        where: {
          [Op.or]: [
            {
              receiver_occupant_id: occupant_id,
              is_temp_access: false,
              gateway_id: gateway.id,
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
              gateway_id: gateway.id,
            }],
        },
      });
      if (!isHavePermission) {
        const err = ErrorCodes['160045'];
        throw err;
      }
    }
    if((process.env.ALLOW_WITHOUT_OCCUPANT == "true" || process.env.ALLOW_WITHOUT_OCCUPANT == true)&& identity_id){
      let userData = await occupantDashboardService.getUserData(identity_id)
      let gatewayIdList = [];
      if (userData && userData.Items && userData.Items.length > 0) {
        gatewayIdList = await occupantDashboardService.getGatewayIdList(userData) || [];
      }
      if(!gatewayIdList.includes(gateway_code)){
        const err = ErrorCodes['160045'];
        throw err;
      }
    }
    if (cloudBridgeConfigsArray && cloudBridgeConfigsArray.length > 0) {
      let existedcloudConfigs = []
      const oneTouchCbCommunicationConfig = await database.one_touch_cb_communication_configs.findAll({
        where: { one_touch_rule_id: oneTouchRule.id },
      }).then((result) => {
        if (result && result.length > 0) {
          result.map((data) => {
            const obj = {};
            obj.config_type = data.config_type;
            obj.camera_id = data.camera_id;
            obj.property_name = data.property_name;
            obj.property_value = data.property_value;
            obj.ruleop = data.ruleop
            existedcloudConfigs.push(obj);
          })
        }
      })
        .catch(() => {
          const err = ErrorCodes['330017'];
          throw err;
        });
      if (existedcloudConfigs.length > 0) {
        let newSetConfigs = []
        cloudBridgeConfigsArray.map((data) => {
          let obj = {}
          obj.config_type = data.config_type;
          obj.camera_id = data.camera_id;
          obj.property_name = data.property_name;
          obj.property_value = data.property_value;
          obj.ruleop = data.ruleop;
          newSetConfigs.push(obj);
          if (data.array_id.includes('{')) {
            uniqueNewConfigs.push(obj);
          }
        });
        existedcloudConfigs.map((ele) => {
          let isduplicate = newSetConfigs.some(obj1 => { return JSON.stringify(obj1) === JSON.stringify(ele); })
          if (isduplicate == false) {
            uniqueExistedConfigs.push(ele);
          }
        })
        if (uniqueExistedConfigs.length > 0) {
          for (const key in uniqueExistedConfigs) {
            let d = uniqueExistedConfigs[key]
            const oldCbConfigs = await database.one_touch_cb_communication_configs.findOne({
              where: {
                config_type: d.config_type,
                camera_id: d.camera_id,
                property_name: d.property_name,
                property_value: d.property_value,
                ruleop: d.ruleop,
                one_touch_rule_id: oneTouchRule.id
              }
            })
              .catch(() => {
                const err = ErrorCodes['330017'];
                throw err;
              });
            const deloneTouchCbCommunicationConfig = await database.one_touch_cb_communication_configs.destroy({
              where: {
                config_type: d.config_type,
                camera_id: d.camera_id,
                property_name: d.property_name,
                property_value: d.property_value,
                ruleop: d.ruleop,
                one_touch_rule_id: oneTouchRule.id
              }
            })
              .catch(() => {
                const err = ErrorCodes['330017'];
                throw err;
              });
            const obj = {
              new: {},
              old: oldCbConfigs,
            };
            const placeholdersData = {};
            ActivityLogs.addActivityLog(Entities.one_touch_rules.entity_name,
              Entities.one_touch_rules.event_name.cbDeleted, obj, Entities.notes.event_name.deleted,
              oneTouchRule.id,
              company_id, user_id, occupant_id, placeholdersData, source_IP);
          }
        }
        if (uniqueNewConfigs.length > 0) {
          const cbCount = uniqueNewConfigs.length;
          const oneTouchCbCommunicationConfigCount = await database.one_touch_cb_communication_configs.count({
            where: { gateway_code: gateway.device_code, },
          }).then((result) => result)
            .catch(() => {
              const err = ErrorCodes['330017'];
              throw err;
            });
          if (oneTouchCbCommunicationConfigCount
            + cbCount < 129) {
            rulesObject = JSON.stringify(rulesObject);
            cloudBridgeConfigsArray = JSON.stringify(cloudBridgeConfigsArray);
            const oneTouchCbConfig = await
              database.one_touch_cb_communication_configs.findAll({
                where: { gateway_code: gateway.device_code },
                raw: true,
              }).catch(() => {
                const err = ErrorCodes['330017'];
                throw err;
              });
            let arrayIds = [];
            arrayIds = lodash.map(oneTouchCbConfig, 'array_id');
            let newArray = []
            if (arrayIds.length > 0) {
              newArray = arrayIds.map((element) => {
                // Check if the element starts with 'i' and ends with 'd'
                if (/^i\d+d$/.test(element)) {
                  // Extract the digit part and replace the element
                  const digitPart = element.match(/\d+/)[0];
                  return digitPart;
                }
                return element;
              });
            }
            console.log("🚀 ~ file: OneTouchRulesService.js:231 ~ newArray:", newArray)

            const data = {};
            const ruleData = {};
            cloudBridgeConfigs.map(async (value, index) => {
              let arrayId = value.array_id;
              if (arrayId.includes('{')) {
                arrayId = arrayId.replace(/[{]/g, '');
                arrayId = arrayId.replace(/[}]/g, '');
              }
              const numberArray = Array.from({ length: 128 }, (_, index) => index + 1);
              const stringArray = numberArray.map((number) => number.toString());
              const uncommonNumbers = newArray.concat(stringArray)
                .filter((number) => !newArray.includes(number) || !stringArray.includes(number));
              newArray.push(uncommonNumbers[0])
              if (arrayId.includes('Action')) {
                data[`${arrayId}`] = uncommonNumbers[0];
                ruleData[`${arrayId}`] = parseInt(uncommonNumbers[0]);
                const variablesToReplace = [arrayId];
                const pattern = new RegExp(`"{{(${variablesToReplace.join('|')})}}"`, 'g');
                rulesObject = rulesObject.replace(pattern, '{{$1}}');
              } else {
                data[`${arrayId}`] = `i${uncommonNumbers[0]}d`
                ruleData[`${arrayId}`] = `i${uncommonNumbers[0]}d`;
              }
            });
            console.log("🚀 ~ file: OneTouchRulesService.js:542 ~ cloudBridgeConfigs.map ~ data:", data)

            const renderedRuleString = mustache.render(rulesObject, ruleData);
            const renderedCbConfigString = mustache.render(cloudBridgeConfigsArray, data);
            rulesObject = JSON.parse(renderedRuleString);
            cloudBridgeConfigsArray = JSON.parse(renderedCbConfigString);
          } else {
            const err = ErrorCodes['330020'];
            throw err;
          }
        }
      }
      else {
        const cbCount = cloudBridgeConfigsArray.length;
        const oneTouchCbCommunicationConfigCount = await database.one_touch_cb_communication_configs.count({
          where: { gateway_code: gateway.device_code },
        }).then((result) => result)
          .catch(() => {
            const err = ErrorCodes['330017'];
            throw err;
          });
        if (oneTouchCbCommunicationConfigCount
          + cbCount < 129) {
          rulesObject = JSON.stringify(rulesObject);
          cloudBridgeConfigsArray = JSON.stringify(cloudBridgeConfigsArray);
          const oneTouchCbConfig = await
            database.one_touch_cb_communication_configs.findAll({
              where: { gateway_code: gateway.device_code },
              raw: true,
            }).catch(() => {
              const err = ErrorCodes['330017'];
              throw err;
            });
          let arrayIds = [];
          arrayIds = lodash.map(oneTouchCbConfig, 'array_id');
          let newArray = []
          if (arrayIds.length > 0) {
            newArray = arrayIds.map((element) => {
              // Check if the element starts with 'i' and ends with 'd'
              if (/^i\d+d$/.test(element)) {
                // Extract the digit part and replace the element
                const digitPart = element.match(/\d+/)[0];
                return digitPart;
              }
              return element;
            });
          }
          console.log("🚀 ~ file: OneTouchRulesService.js:231 ~ newArray:", newArray)

          const data = {};
          cloudBridgeConfigs.map(async (value, index) => {
            let arrayId = value.array_id;
            if (arrayId.includes('{')) {
              arrayId = arrayId.replace(/[{]/g, '');
              arrayId = arrayId.replace(/[}]/g, '');
            }
            const numberArray = Array.from({ length: 128 }, (_, index) => index + 1);
            const stringArray = numberArray.map((number) => number.toString());
            const uncommonNumbers = newArray.concat(stringArray)
              .filter((number) => !newArray.includes(number) || !stringArray.includes(number));
            newArray.push(uncommonNumbers[0])
            if (arrayId.includes('Action')) {
              data[`${arrayId}`] = uncommonNumbers[0];
              ruleData[`${arrayId}`] = parseInt(uncommonNumbers[0]);
              const variablesToReplace = [arrayId];
              const pattern = new RegExp(`"{{(${variablesToReplace.join('|')})}}"`, 'g');
              rulesObject = rulesObject.replace(pattern, '{{$1}}');
            } else {
              data[`${arrayId}`] = `i${uncommonNumbers[0]}d`
              ruleData[`${arrayId}`] = `i${uncommonNumbers[0]}d`;
            }
          });

          console.log("🚀 ~ file: OneTouchRulesService.js:609 ~ cloudBridgeConfigs.map ~ data:", data)

          const renderedRuleString = mustache.render(rulesObject, ruleData);
          const renderedCbConfigString = mustache.render(cloudBridgeConfigsArray, data);
          rulesObject = JSON.parse(renderedRuleString);
          cloudBridgeConfigsArray = JSON.parse(renderedCbConfigString);
        } else {
          const err = ErrorCodes['330020'];
          throw err;
        }

      }
    }

    const oneTouchRuleObj = await database.one_touch_rules.update({
      rule: rulesObject,
    }, {
      where,
      returning: true,
    }).then((result) => result)
      .catch(() => {
        const err = ErrorCodes['330001'];
        throw err;
      });

    // if (Object.keys(afterUpdateOneTouchRule).length > 0) {
    //   return afterUpdateOneTouchRule;
    // }

    if (!oneTouchRuleObj || oneTouchRuleObj[0] == 0) {
      const err = ErrorCodes['330001'];
      throw err;
    }
    rulesActionTriggerKeyList = await OneTouchRulesService.getAllActionTriggerKeyList( oneTouchRule.id)
          .then((result) => result).catch((e) => {
            throw (e);
          });
    rulesActionTriggerKeyList = lodash.map(rulesActionTriggerKeyList, 'action_trigger_key');
    if (communicationConfigs && communicationConfigs.length > 0) {
      for (const key in communicationConfigs) {
        const element = communicationConfigs[key];
        const { action_trigger_key } = element;
        actionTriggerKeyList.push(action_trigger_key);
        const { emails } = element;
        const { phone_numbers } = element;
        const { message } = element;
        // update one touch communication config
        const oneTouchCommunicationConfigObject = await OneTouchCommunicationConfigService.getOneTouchCommunicationConfigActionData(action_trigger_key)
        .then((result) => result).catch((e) => {
          throw (e);
        });
      // creeting reference in one_touch_rule_reference
      if (!oneTouchCommunicationConfigObject) {
        const communicationConfigsObj = await OneTouchCommunicationConfigService.createOneTouchCommunicationConfigData(oneTouchRule.id, action_trigger_key, emails, phone_numbers, message, company_id, occupant_id, source_IP)
          .then((result) => result).catch((e) => {
            throw (e);
          });
      }else{
        const updateCommunicationConfigs = await this.updateOneTouchCommunicationConfigAction(action_trigger_key, element, company_id, occupant_id, source_IP);
        if (!updateCommunicationConfigs) {
          const err = ErrorCodes['330007'];
          throw err;
        }
      }
      }
    }
    // check if sent body's action trigger key is present in one touch rule ids action trigger key list
    let deleteRecord = rulesActionTriggerKeyList.filter((element) => !actionTriggerKeyList.includes(element));
    // rule action trigger key is extra and not thr for update delete it.
    for (const key in deleteRecord) {
      const element = deleteRecord[key];
      const deleteData = await this.deleteRecord(element, oneTouchRule.id, occupant_id, company_id, user_id, source_IP)
        .then((result) => result).catch((e) => {
          throw (e);
        });
    }
    if (cloudBridgeConfigsArray) {
      if (cloudBridgeConfigsArray.length > 0) {
        for (const key in cloudBridgeConfigsArray) {
          const element = cloudBridgeConfigsArray[key];
          const {
            config_type, camera_id, array_id,
            property_name, property_value, ruleop, device_code,
          } = element;
          const cbommunicationConfigsObj = await OneTouchCbCommunicationConfigService.addCbConfigs(gateway.device_code, config_type, camera_id, array_id, property_name,
            property_value, ruleop, device_code, occupant_id, company_id, user_id, oneTouchRule.id, source_IP)
            .catch((error) => {
              const err = ErrorCodes['330019'];
              throw err;
            });
        }
      } else {
        const oldCbConfigs = await database.one_touch_cb_communication_configs.findAll({
          where: {
            one_touch_rule_id: oneTouchRule.id
          }
        })
          .catch(() => {
            const err = ErrorCodes['330017'];
            throw err;
          });
        if (oldCbConfigs.length > 0) {
          const deloneTouchCbCommunicationConfig = await database.one_touch_cb_communication_configs.destroy({
            where: {
              one_touch_rule_id: oneTouchRule.id
            }
          })
            .catch(() => {
              const err = ErrorCodes['330017'];
              throw err;
            });
          const obj = {
            new: {},
            old: oldCbConfigs,
          };
          const placeholdersData = {};
          ActivityLogs.addActivityLog(Entities.one_touch_rules.entity_name,
            Entities.one_touch_rules.event_name.cbDeleted, obj, Entities.notes.event_name.deleted,
            oneTouchRule.id,
            company_id, user_id, occupant_id, placeholdersData, source_IP);
        }
      }
    }
    afterUpdateOneTouchRule = await this.getOneTouchRule(rule_trigger_key, key, occupant_id);
    // console.log("🚀 ~ file: OneTouchRulesService.js:378 ~ afterUpdateOneTouchRule:", afterUpdateOneTouchRule)
    if (!afterUpdateOneTouchRule) {
      const err = ErrorCodes['330002'];
      throw err;
    }
    const obj = {
      new: oneTouchRuleObj[1][0],
      old: oneTouchRule,
    };
    const placeholdersData = {};
    if (grid_order && occupant_id) {
      const input = {
        item_id: oneTouchRule.id,
        type: 'one_touch_rule',
        grid_order,
      };
      await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(input,
        company_id, occupant_id, source_IP).catch((err) => { throw err; });
    } else {
      // const dashboardAttributes = await database.occupants_dashboard_attributes.findOne({
      //   where: { item_id: oneTouchRule.id, occupant_id },
      // }).catch(() => {
      //   const err = ErrorCodes['160025'];
      //   throw err;
      // });
      // if (dashboardAttributes) {
      //   await OccupantsDashboardAttributesService.deleteOccupantsDashboardAttributes(dashboardAttributes.id, occupant_id, company_id).catch((err) => {
      //     throw err;
      //   });
      // }
    }
    if (JSON.stringify(oneTouchRule.rule) !== JSON.stringify(afterUpdateOneTouchRule.rule)) {
      ActivityLogs.addActivityLog(Entities.one_touch_rules.entity_name,
        Entities.one_touch_rules.event_name.updated, obj, Entities.notes.event_name.updated, oneTouchRule.id,
        company_id, user_id, occupant_id, placeholdersData, source_IP);
    }
    return {
      afterUpdateOneTouchRule,
      gateway
    };
  }

  static async updateOneTouchGroupsRules(key) {
    const deleteOneTouchGroupsRules = await database.sequelize.query(`
    WITH new_rules AS (
      SELECT
          id,
          rules #- array[(position - 1)::text] AS new_value
      FROM
          rule_groups,
          jsonb_array_elements(rules) WITH ORDINALITY arr(item, position)
      WHERE
          rule_groups.rules @> '[{"key":"${key}"}]'
          AND
          item->>'key' = '${key}'
      )
  UPDATE rule_groups SET rules = new_rules.new_value FROM new_rules WHERE rule_groups.id = new_rules.id;
  `).catch(() => {
      const err = ErrorCodes['370004'];
      throw err;
    });
    return deleteOneTouchGroupsRules;
  }

  static async deleteOneTouchRule(rule_trigger_key, company_id, occupant_id, user_id, key, source_IP) {
    let where = {};
    if (rule_trigger_key) {
      where = {
        rule_trigger_key,
      };
    } else if (key) {
      where = {
        key,
      };
    }
    const oneTouchRule = await database.one_touch_rules.findOne({
      where,
    }).then((result) => result);

    if (!oneTouchRule) {
      const err = ErrorCodes['330002'];
      throw err;
    }

    const oneTouchRuleObj = await database.one_touch_rules.destroy({
      where,
      returning: true,
    }).then(async (result) => {
      if (result) {
        this.updateOneTouchGroupsRules(oneTouchRule.key).catch((err) => {
          throw err;
        });
        database.one_touch_communication_configs.destroy({
          where: {
            one_touch_rule_id: oneTouchRule.id,
          },
          returning: true,
        }).then((data) => {
          if (data) {
            const obj = {
              new: {},
              old: oneTouchRule,
            };
            const placeholdersData = {};
            ActivityLogs.addActivityLog(Entities.one_touch_communication_config.entity_name, Entities.one_touch_communication_config.event_name.deleted,
              obj, Entities.notes.event_name.deleted, oneTouchRule.id, company_id, user_id, occupant_id, placeholdersData, source_IP);
          }
          return data;
        }).catch(() => {
          const err = ErrorCodes['330008'];
          throw err;
        });
      }
      return result;
    }).catch((error) => {
      console.log("🚀 ~ file: OneTouchRulesService.js:423 ~ OneTouchRulesService ~ deleteOneTouchRule ~ error:", error)
      const err = ErrorCodes['330004'];
      throw err;
    });
    const placeholdersData = {};
    const obj = {
      new: {},
      old: oneTouchRule,
    };

    ActivityLogs.addActivityLog(Entities.one_touch_rules.entity_name,
      Entities.one_touch_rules.event_name.deleted, obj, Entities.notes.event_name.deleted, oneTouchRule.id,
      company_id, user_id, occupant_id, placeholdersData, source_IP);
    return {
      message: Responses.responses.one_touch_delete_message,
    };
  }

  static async getOneTouchRuleGroups(key) {
    const idList = await database.sequelize.query(`select id from rule_groups,jsonb_to_recordset(rule_groups.rules) as items(key text)
    where items.key ='${key}'`).then((result) => {
      if (!result[0] || result[0].length == 0) {
        return [];
      }
      const idList = [];
      for (const element of result[0]) {
        idList.push(element.id);
      }
      return idList;
    }).catch(() => {
      const err = ErrorCodes['370001'];
      throw err;
    });
    if (idList && idList.length > 0) {
      const getAllRuleGroups = await database.rule_groups.findAll({
        where: {
          id: {
            [Op.in]: idList,
          },
        },
        raw: true,
      }).then((result) => result)
        .catch(() => {
          const err = ErrorCodes['370001'];
          throw err;
        });
      return getAllRuleGroups;
    }
    return [];
  }

  static async getOneTouch(key) {
    const oneTouchRuleObj = await database.one_touch_rules.findOne({
      include: [
        { model: database.devices }
      ],
      where: {
        key,
      },
    }).then(async (result) => result);
    if (!oneTouchRuleObj) {
      const err = ErrorCodes['330002'];
      throw err;
    }
    return oneTouchRuleObj;
  }

  static async getOneTouchRule(rule_trigger_key, key, occupant_id) {
    let where = {};
    // if (rule_trigger_key) {
    //   where = {
    //     rule_trigger_key,
    //   };
    // } else if (key) {
    where = {
      key,
    };
    // }

    const oneTouchRuleObj = await database.one_touch_rules.findOne({
      include: [
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          as: 'dashboard_attributes',
          where: {
            occupant_id
          }
        }, {
          model: database.one_touch_communication_configs,
          as: 'communication_configs',
        }, {
          model: database.one_touch_cb_communication_configs,
          as: 'cloud_bridge_configs',
        },
      ],
      where,
    }).then(async (result) => {
      if (!result) {
        return result;
      }
      const oneTouchRule = result;
      if (!result.dashboard_attributes) {
        oneTouchRule.dataValues.dashboard_attributes = {
          type: 'one_touch_rule',
        };
      }
      const ruleGroups = await this.getOneTouchRuleGroups(oneTouchRule.key)
        .catch((err) => {
          throw err;
        });
      oneTouchRule.dataValues.rule_groups = ruleGroups;
      return oneTouchRule;
    }).catch(() => {
      const err = ErrorCodes['330002'];
      throw err;
    });
    if (!oneTouchRuleObj) {
      const err = ErrorCodes['330002'];
      throw err;
    }
    return oneTouchRuleObj;
  }

  static async getOneTouchRules(gateway_code, networkwifimac, occupant_id, user_id, isAdmin = false,identity_id) {
    let where = {};
    if (networkwifimac) {
      where = {
        device_code: {
          [Op.iLike]: `%${networkwifimac}%`,
        },
        type: 'gateway',
      };
    } else {
      where = {
        device_code: gateway_code,
      };
    }
    const gateway = await database.devices.findOne({
      where,
      raw: true,
    }).then((result) => result);
    if (!gateway) {
      const err = ErrorCodes['800013'];
      throw err;
    }

    if (isAdmin == false) {
      if (!user_id && occupant_id) {
        const isHavePermission = await database.occupants_permissions.findOne({
          where: {
            [Op.or]: [
              {
                receiver_occupant_id: occupant_id,
                is_temp_access: false,
                gateway_id: gateway.id,
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
                gateway_id: gateway.id,
              }],
          },
        });
        if (!isHavePermission) {
          const err = ErrorCodes['160045'];
          throw err;
        }
      }
      if((process.env.ALLOW_WITHOUT_OCCUPANT == "true" || process.env.ALLOW_WITHOUT_OCCUPANT == true)&& identity_id){
        let userData = await occupantDashboardService.getUserData(identity_id).catch(err=>{
          console.log("🚀 ~ userData ~ err:", err)
        })
        let gatewayIdList = [];
        if (userData && userData.Items && userData.Items.length > 0) {
          gatewayIdList = await occupantDashboardService.getGatewayIdList(userData).catch(err=>{
            console.log("🚀 ~ gatewayIdList=awaitoccupantDashboardService.getGatewayIdList ~ err:", err)
        }) || [];
        }
        if(!gatewayIdList.includes(gateway_code)){
          const err = ErrorCodes['160045'];
          throw err;
        }
      }
    }

    let occupants_dashboard_attributes = {
      required: false,
      attributes: ['id', 'type', 'grid_order'],
      model: database.occupants_dashboard_attributes,
      as: 'dashboard_attributes',
    }
    if (occupant_id) {
      occupants_dashboard_attributes["where"] = {
        occupant_id
      }
    }

    const oneTouchRuleObj = await database.one_touch_rules.findAll({
      attributes: ['rule', 'key', 'rule_trigger_key', 'id'],
      include: [
        occupants_dashboard_attributes
        , {
          model: database.one_touch_communication_configs,
          as: 'communication_configs',
        }, {
          model: database.one_touch_cb_communication_configs,
          as: 'cloud_bridge_configs',
        },
      ],
      where: {
        gateway_id: gateway.id,
      },
      order: [['created_at', 'ASC']],
    }).then(async (result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const promiseList = [];
      const oneTouchRuleList = [];
      for (const element of result) {
        const oneTouchRuleObj = element.dataValues;
        if (!element.dashboard_attributes) {
          oneTouchRuleObj.dashboard_attributes = {
            type: 'one_touch_rule',
          };
        }
        promiseList.push(this.getOneTouchRuleGroups(oneTouchRuleObj.key).then(result => {
          oneTouchRuleObj.rule_groups = result;
          oneTouchRuleList.push(oneTouchRuleObj);
        }).catch((err) => { throw err; }))
      }
      const onetouchRuleObj = await Promise.all(promiseList).then((result) => {
        return true
      }).catch((err) => {
        throw err;
      });
      return oneTouchRuleList;
    }).catch(() => {
      const err = ErrorCodes['330003'];
      throw err;
    });
    return oneTouchRuleObj;
  }

  static async getGatewayOneTouchRules(id) {
    let rulesObj = {
      rules: [],
      linkedDevices_list: [],
    };

    const oneTouchReferenceObj = await database.device_references.findOne({
      where: { id },
      raw: true,
    }).then((result) => result).catch(() => null);
    if (!oneTouchReferenceObj) {
      return rulesObj;
    }
    if (oneTouchReferenceObj.data && oneTouchReferenceObj.data != null) {
      return oneTouchReferenceObj.data;
    } else {
      const onetouchRuleObj = await database.one_touch_rules.findAll({
        where: {
          gateway_id: oneTouchReferenceObj.device_id,
        },
      }).then((result) => result)
        .catch((error) => {
          const err = ErrorCodes['330016'];
          throw err;
        });
      // new code added to merge predefined rules in one touch rules object.
      const preDefinedRuleObj = await database.predefined_rules.findAll({
        where: {
          gateway_id: oneTouchReferenceObj.device_id,
        },
      }).then((result) => result)
        .catch((error) => {
          const err = ErrorCodes['350007'];
          throw err;
        });
      const linkedDeviceList = await this.getLinkedDevices(oneTouchReferenceObj.device_id);

      if (!preDefinedRuleObj || !onetouchRuleObj || !linkedDeviceList) {
        return rulesObj;
      }
      let finalRulesArray = [];
      let rulesOfBoth = onetouchRuleObj.concat(preDefinedRuleObj);
      let arrayOfRules = rulesOfBoth.map(({ rule }) => rule);
      for (const key in arrayOfRules) {
        const element = arrayOfRules[key];
        const activeValue = element.active;
        if (activeValue == true) {
          finalRulesArray.push(element);
        }
      }
      rulesObj = {
        rules: finalRulesArray,
        linkedDevices_list: linkedDeviceList,
      };

      return rulesObj;
    }
  }

  static async getGatewayOneTouchRulesByDeviceId(device_id) {
    let rulesObj = {
      rules: [],
      linkedDevices_list: [],
    };

    const onetouchRuleObj = await database.one_touch_rules.findAll({
      where: {
        gateway_id: device_id,
      },
    }).then((result) => result)
      .catch((error) => {
        const err = ErrorCodes['330016'];
        throw err;
      });
    // new code added to merge predefined rules in one touch rules object.
    const preDefinedRuleObj = await database.predefined_rules.findAll({
      where: {
        gateway_id: device_id,
      },
    }).then((result) => result)
      .catch((error) => {
        const err = ErrorCodes['350007'];
        throw err;
      });
    const linkedDeviceList = await this.getLinkedDevices(device_id);

    if (!preDefinedRuleObj || !onetouchRuleObj || !linkedDeviceList) {
      return rulesObj;
    }
    let finalRulesArray = [];
    let rulesOfBoth = onetouchRuleObj.concat(preDefinedRuleObj);
    let arrayOfRules = rulesOfBoth.map(({ rule }) => rule);
    for (const key in arrayOfRules) {
      const element = arrayOfRules[key];
      const activeValue = element.active;
      if (activeValue == true) {
        finalRulesArray.push(element);
      }
    }
    rulesObj = {
      rules: finalRulesArray,
      linkedDevices_list: linkedDeviceList,
    };

    return rulesObj;
  }

  static async updateOneTouchCommunicationConfigAction(action_trigger_key, body, companyId, occupantId, source_IP) {
    const oldObj = {};
    const newObj = {};
    let message = body.message;
    // already checked
    const oneTouchCommunicationConfig = await OneTouchCommunicationConfigService.getOneTouchCommunicationConfigActionData(action_trigger_key);
    if (!oneTouchCommunicationConfig) {
      const err = ErrorCodes['330010'];
      throw err;
    }
    let configMessage = oneTouchCommunicationConfig.message;
    let oneTouchObj = await database.one_touch_rules.findOne({
      where: {
        id: oneTouchCommunicationConfig.one_touch_rule_id
      }
    }).then((result) => result);

    if (!oneTouchObj) {
      const err = ErrorCodes['330002'];
      throw err;
    }
    if (!configMessage || !message) {
      body.message = `${oneTouchObj.rule.name} alert message`;
    }
    const updateOneTouchCommunicationConfig = await database.one_touch_communication_configs.update(body, {
      where: { action_trigger_key },
      returning: true,
      raw: true,
    }).then((result) => result)
      .catch((error) => {
        const err = ErrorCodes['330007'];
        throw err;
      });
    const afterUpdate = await OneTouchCommunicationConfigService.getOneTouchCommunicationConfigActionData(action_trigger_key);
    if (!oneTouchCommunicationConfig) {
      const err = ErrorCodes['330010'];
      throw err;
    }
    Object.keys(body).forEach((key) => {
      if (JSON.stringify(oneTouchCommunicationConfig[key]) !== JSON.stringify(body[key])) {
        oldObj[key] = oneTouchCommunicationConfig[key];
        newObj[key] = body[key];
      }
    });
    const obj = {
      old: oldObj,
      new: newObj,
    };
    const deletedExistingData = { ...oneTouchCommunicationConfig };
    delete deletedExistingData.updated_at;

    const deletedAfterUpdate = { ...afterUpdate };
    delete deletedAfterUpdate.updated_at;

    const placeholdersData = {};

    if (JSON.stringify(deletedExistingData) !== JSON.stringify(deletedAfterUpdate)) {
      ActivityLogs.addActivityLog(Entities.one_touch_communication_config.entity_name, Entities.one_touch_communication_config.event_name.updated,
        obj, Entities.notes.event_name.updated, oneTouchCommunicationConfig.id, companyId, null, occupantId, placeholdersData, source_IP);
    }
    return afterUpdate;
  }

  static async getAllActionTriggerKeyList(one_touch_rule_id) {
    const oneTouchCommunicationConfigObj = await database.one_touch_communication_configs.findAll({
      where: { one_touch_rule_id },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['330011'];
      throw err;
    });
    return oneTouchCommunicationConfigObj;
  }

  static async deleteRecord(action_trigger_key, one_touch_rule_id, occupant_id, company_id, user_id, source_IP) {
    const oneTouchCommunicationConfigObj = await database.one_touch_communication_configs.destroy({
      where: { action_trigger_key },
      raw: true,
    }).then((data) => {
      if (data) {
        const obj = {
          new: {},
          old: { action_trigger_key },
        };
        const placeholdersData = {};
        ActivityLogs.addActivityLog(Entities.one_touch_communication_config.entity_name, Entities.one_touch_communication_config.event_name.deleted,
          obj, Entities.notes.event_name.deleted, one_touch_rule_id, company_id, user_id, occupant_id, placeholdersData, source_IP);
      }
    }).catch(() => {
      const err = ErrorCodes['330008'];
      throw err;
    });

    return oneTouchCommunicationConfigObj;
  }

  static async getLinkedDevices(gateway_id) {
    const singleControls = await database.single_controls.findAll({
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
      where: { gateway_id },
    }).then((result) => {
      if (!result) {
        return [];
      }
      const resultArray = [];
      for (const element of result) {
        const obj = {
          linkedDevices: {
            name: element.name,
          },
          key: element.id
        };
        const defaultDeviceCode = element.device.device_code;
        const defaultDeviceCodeSplitArray = defaultDeviceCode.split('-');
        const defaultDevice = defaultDeviceCodeSplitArray[3];
        obj.linkedDevices.defaultDevice = defaultDevice.toLowerCase();
        obj.linkedDevices.devices = [];
        if (element.single_control_devices) {
          for (const single_control_device of element.single_control_devices) {
            const deviceCode = single_control_device.device.device_code;
            const deviceCodeSplitArray = deviceCode.split('-');
            const euid = deviceCodeSplitArray[3];
            const deviceObj = {
              oem_model: 'it600ThermHW',
              EUID: euid.toLowerCase(),
            };
            obj.linkedDevices.devices.push(deviceObj);
          }
        }
        resultArray.push(obj);
      }

      return resultArray;
    }).catch(() => []);
    return singleControls;
  }

  static async updateRuleGroups(ruleTriggerKey,
    ruleGroupIds, occupantId, companyId, userId, key, source_IP) {
    let where = {};
    if (ruleTriggerKey) {
      where = {
        rule_trigger_key: ruleTriggerKey,
      };
    } else if (key) {
      where = {
        key,
      };
    }
    const oneTouchObj = await database.one_touch_rules.findOne({
      where,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['330002'];
      throw err;
    });
    if (!oneTouchObj) {
      const err = ErrorCodes['330002'];
      throw err;
    }
    const { gateway_id } = oneTouchObj;
    var { key } = oneTouchObj.rule;

    // find all records and search for key
    if (gateway_id) {
      const getAllRuleObj = await database.rule_groups.findAll({
        where: {
          gateway_id,
        },
      }).then((result) => result).catch((error) => {
        const err = ErrorCodes['370001'];
        throw err;
      });
      if (getAllRuleObj.length > 0) {
        for (const item in getAllRuleObj) {
          const element = getAllRuleObj[item];
          const rules_id = element.id;
          const rulesObject = element.rules;

          // found all rules of that gateway in rulesArray
          const rulesKeyValue = lodash.map(rulesObject, 'key');
          if (!ruleGroupIds.includes(rules_id) && rulesKeyValue.includes(key)) {
            const update_rules = rulesObject.filter((value) => value.key != key);

            // newArray contains rules except key in it
            await database.rule_groups.update({
              rules: update_rules,
            }, {
              where: {
                id: rules_id,
              },
            }).then((result) => result).catch(() => {
              const err = ErrorCodes['370004'];
              throw err;
            });
            const oldObj = { rules: rulesObject };
            const newObj = { rules: update_rules };
            const obj = {
              old: oldObj,
              new: newObj,
            };
            ActivityLogs.addActivityLog(Entities.rule_groups.entity_name, Entities.rule_groups.event_name.updated,
              obj, Entities.notes.event_name.updated, element.id, companyId, userId, occupantId, null, source_IP);
          }
        }
      }
    }

    if (ruleGroupIds && ruleGroupIds.length > 0) {
      for (const data in ruleGroupIds) {
        const element = ruleGroupIds[data];
        const getRuleGroupData = await RuleGroupsService.getRuleGroups(element, companyId)
          .then((result) => result).catch((error) => {
            const err = ErrorCodes['370001'];
            throw err;
          });
        if (getRuleGroupData && getRuleGroupData.rules) {
          const { rules } = getRuleGroupData;
          const rulesData = [...rules];
          const oldKeys = lodash.map(rulesData, 'key');
          const checkKey = oldKeys.includes(key);
          if (checkKey !== true) {
            rulesData.push({ key });
            const updateData = {
              rules: rulesData,
            };
            await database.rule_groups.update(updateData, {
              where: {
                id: element,
              },
            }).then((result) => result).catch(() => {
              const err = ErrorCodes['370004'];
              throw err;
            });
            const oldObj = { rules: getRuleGroupData.rules };
            const newObj = updateData;
            const obj = {
              old: oldObj,
              new: newObj,
            };
            ActivityLogs.addActivityLog(Entities.rule_groups.entity_name, Entities.rule_groups.event_name.updated,
              obj, Entities.notes.event_name.updated, element, companyId, userId, occupantId, null, source_IP);
          }
        }
      }
    }
    const ruleObj = await this.getOneTouchRule(ruleTriggerKey, key, occupantId)
      .catch((err) => {
        throw err;
      });
    return ruleObj;
  }
}

export default OneTouchRulesService;
