import Util from '../../utils/Utils';
import database from '../../models';
import OneTouchRulesService from '../services/OneTouchRulesService';
import ApplicationError from '../../errors/ApplicationError';
import Logger from '../../utils/Logger';
import ErrorCodes from '../../errors/ErrorCodes';
import Responses from '../../utils/constants/Responses';
import OneTouchCommunicationService from '../services/OneTouchCommunicationConfigService';

const lodash = require('lodash');
const uuid = require('uuid');

const util = new Util();

class OneTouchController {
  static async addOneTouchRule(req, res) {
    const {
      one_touch_rules, gateway_code, company_id,
    } = req.body;
    const { occupant_id, user_id } = req;
    const onetouchRuleObjList = [];
    const gateway = await database.devices.findOne({
      where: { device_code: gateway_code },
      raw: true,
    }).then((result) => result);
    if (!gateway) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    if (one_touch_rules && one_touch_rules.length > 0) {
      let keyList = []
      await one_touch_rules.map(async (ele) => {
        keyList.push(ele.rule.key)
      })
      for (const element in one_touch_rules) {
        let key = uuid.v4();
        const oneTouchRule = one_touch_rules[element];
        const { rule } = oneTouchRule;
        if (rule.key) {
          key = rule.key;
        } else {
          rule.key = key;
          keyList.push(rule.key);
        }
        const name = rule.name;
        const communicationConfigs = oneTouchRule.communication_configs;
        const cloudBridgeConfigs = oneTouchRule.cloud_bridge_configs;
        const { rule_trigger_key, grid_order } = oneTouchRule;
        const onetouchRuleObj = await OneTouchRulesService.addOneTouchRule(rule, rule_trigger_key, key, gateway_code, company_id,
          occupant_id, user_id, grid_order, communicationConfigs, name, keyList, cloudBridgeConfigs)
          .then((result) => result).catch((e) => {
            const err = e;
            throw (err);
          });
        onetouchRuleObjList.push(onetouchRuleObj);
      };
      await OneTouchRulesService.publishJsonRuleUrl(gateway.id, gateway_code, company_id).then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    }
    util.setSuccess(200, onetouchRuleObjList);
    return util.send(req, res);
  }

  static async updateOneTouchRules(req, res) {
    const { one_touch_rules } = req.body;
    const { occupant_id, company_id, user_id } = req;
    let getOneTouchRule = null;
    const getOneTouchRuleTriggerKeyIdList = []; // 1st for loop
    const actionTriggerKeyList = []; // 2nd for loop
    let rulesActionTriggerKeyList = [];
    let deleteRecord = []; // delete record
    // const message = { message: Responses.responses.one_touch_multiple_update_message };
    const returnUpdatedRulesArray = [];
    if (one_touch_rules && one_touch_rules.length > 0) {
      for (const key in one_touch_rules) {
        const one_touch_rules_element = one_touch_rules[key];
        const { rule_trigger_key } = one_touch_rules_element;
        const rulKey = one_touch_rules_element.rule.key;
        const communicationConfigs = one_touch_rules_element.communication_configs;
        const cloudBridgeConfigs = one_touch_rules.cloud_bridge_configs;

        getOneTouchRule = await OneTouchRulesService.getOneTouchRule(rule_trigger_key, rulKey, occupant_id)
          .catch((e) => {
            throw (e);
          });
        const one_touch_rule_id = getOneTouchRule.id;
        getOneTouchRuleTriggerKeyIdList.push(getOneTouchRule.id);
        // if not present in array the action trigger key then delete that list only gets the action trigger key list
        rulesActionTriggerKeyList = await OneTouchRulesService.getAllActionTriggerKeyList(one_touch_rule_id)
          .then((result) => result).catch((e) => {
            throw (e);
          });
        rulesActionTriggerKeyList = lodash.map(rulesActionTriggerKeyList, 'action_trigger_key');

        // check one touch communication config data
        if (communicationConfigs && communicationConfigs.length > 0) {
          for (const key in communicationConfigs) {
            const element = communicationConfigs[key];
            const { action_trigger_key } = element;
            const { emails } = element;
            const { phone_numbers } = element;
            const { message } = element;
            actionTriggerKeyList.push(action_trigger_key);

            const oneTouchCommunicationConfigObject = await OneTouchCommunicationService.getOneTouchCommunicationConfigActionData(action_trigger_key)
              .then((result) => result).catch((e) => {
                throw (e);
              });
            // creeting reference in one_touch_rule_reference
            if (!oneTouchCommunicationConfigObject) {
              const communicationConfigsObj = await OneTouchCommunicationService.createOneTouchCommunicationConfigData(getOneTouchRule.id, action_trigger_key, emails, phone_numbers, message, company_id, occupant_id)
                .then((result) => result).catch((e) => {
                  throw (e);
                });
            }
          }
          // check if sent body's action trigger key is present in one touch rule ids action trigger key list
          deleteRecord = rulesActionTriggerKeyList.filter((element) => !actionTriggerKeyList.includes(element));
          // rule action trigger key is extra and not thr for update delete it.
          for (const key in deleteRecord) {
            const element = deleteRecord[key];
            const deleteData = await OneTouchRulesService.deleteRecord(element, one_touch_rule_id, occupant_id, company_id, user_id)
              .then((result) => result).catch((e) => {
                throw (e);
              });
          }
        }

      }
      const keyList = []
      await one_touch_rules.map(async (ele) => {
        keyList.push(ele.rule.key)
      });
      for (const key in one_touch_rules) {
        const one_touch_rules_element = one_touch_rules[key];
        const { rule } = one_touch_rules_element;
        const { rule_trigger_key, grid_order } = one_touch_rules_element;
        const ruleKey = rule.key;
        const name = rule.name;
        const communicationConfigs = one_touch_rules_element.communication_configs;
        const cloudBridgeConfigs = one_touch_rules_element.cloud_bridge_configs;

        const onetouchRuleObj_Data = await OneTouchRulesService.updateOneTouchRule(rule, rule_trigger_key, company_id, occupant_id,
          user_id, grid_order, communicationConfigs, ruleKey, name, keyList, cloudBridgeConfigs)
          .then((result) => {
            returnUpdatedRulesArray.push(result);
          })
          .catch((e) => {
            Logger.error('Error', e);
          });
      }
    }
    util.setSuccess(200, returnUpdatedRulesArray);
    return util.send(req, res);
  }

  static async getOneTouchRule(req, res) {
    const { rule_trigger_key, key } = req.query;
    const { occupant_id } = req;
    const onetouchRuleObj = await OneTouchRulesService.getOneTouchRule(rule_trigger_key, key, occupant_id)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, onetouchRuleObj);
    return util.send(req, res);
  }

  static async getOneTouchRules(req, res) {
    const { gateway_code, networkwifimac } = req.query;
    const { occupant_id, user_id } = req;
    const onetouchRulesObj = await OneTouchRulesService.getOneTouchRules(gateway_code, networkwifimac, occupant_id, user_id)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, onetouchRulesObj);
    return util.send(req, res);
  }

  static async deleteOneTouchRule(req, res) {
    const { rule_trigger_key, key } = req.query;
    const { company_id } = req.body;
    const { occupant_id, user_id } = req;
    const onetouchRuleObj = await OneTouchRulesService.deleteOneTouchRule(rule_trigger_key, company_id, occupant_id, user_id, key)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, onetouchRuleObj);
    return util.send(req, res);
  }

  static async getGatewayOneTouchRules(req, res) {
    const { ref } = req.query;
    const gatewayOneTouchRules = await OneTouchRulesService.getGatewayOneTouchRules(ref)
      .catch((err) => {
        throw new ApplicationError(err);
      });

    res.status(200).json(gatewayOneTouchRules);

  }

  static async updateRuleGroups(req, res) {
    const ruleTriggerKey = req.body.rule_trigger_key;
    const { key } = req.body;
    const ruleGroupIds = req.body.rule_group_ids;
    const occupantId = req.occupant_id;
    const companyId = req.body.company_id;
    const userId = req.user_id;
    const updateRuleGroups = await OneTouchRulesService.updateRuleGroups(ruleTriggerKey,
      ruleGroupIds, occupantId, companyId, userId, key)
      .then((result) => result).catch((e) => {
        throw (e);
      });
    util.setSuccess(200, updateRuleGroups);
    return util.send(req, res);
  }
  static async deleteMultipleOneTouchRule(req, res) {
    const { keys } = req.body;
    const { company_id } = req.body;
    const { occupant_id, user_id } = req;
    const promiseList = [];
    let onetouchRuleResponse = null;
    let gatewayList = []
    if (keys && keys.length > 0) {
      for (const key in keys) {
        const rulKey = keys[key];
        let result = await OneTouchRulesService.getOneTouch(rulKey)
          .catch((e) => {
            throw (e);
          });
        if (result) {
          let listt = lodash.map(gatewayList, element => { return element.device_code })
          if (!listt.includes(result.device.dataValues.device_code)) {
            gatewayList.push({
              device_code: result.device.dataValues.device_code,
              id: result.device.dataValues.id
            })
            const rule_trigger_key = null;
            promiseList.push(await OneTouchRulesService.deleteOneTouchRule(rule_trigger_key, company_id, occupant_id, user_id, rulKey, false));

          }
        }
      }
      const onetouchRuleObj = await Promise.all(promiseList).then((result) => {
        if (result) {
          return {
            message: Responses.responses.one_touch_delete_message,
          };
        }
      }).catch((err) => {
        throw err;
      });
      let publishJsonUrl = async function (device_code, gateway_id, company_id) {
        const oneTouchReferenceObj = await OneTouchRulesService.addDeviceReference(gateway_id).catch((err) => {
          throw err;
        });;
        if (!oneTouchReferenceObj) {
          const err = ErrorCodes['330005'];
          throw err;
        }
        const ref = oneTouchReferenceObj.id;
        const host = process.env.SERVICE_API_HOST;
        const url = `https://${host}/api/v1/one_touch/gateway_rules?ref=${ref}`;
        // creates a json object
        await OneTouchRulesService.publishJsonUrl(company_id, device_code, url, false).catch((err) => {
          throw err;
        });

      }
      if (gatewayList.length > 1) {
        let promisePublishList = []
        for (const element in gatewayList) {
          promisePublishList.push(publishJsonUrl(element.device_code, element.id, company_id))
        }
        await Promise.all(promisePublishList).then((result) => {
          return {
            message: Responses.responses.one_touch_delete_message,
          };
        }).catch((err) => {
          throw err;
        });
      } else if (gatewayList.length == 1) {
        await publishJsonUrl(gatewayList[0].device_code, gatewayList[0].id, company_id).catch((err) => {
          throw err;
        });
      }
      onetouchRuleResponse = Responses.responses.multiple_one_touch_delete_message;
    }

    util.setSuccess(200, onetouchRuleResponse);
    return util.send(req, res);
  }
}

export default OneTouchController;
