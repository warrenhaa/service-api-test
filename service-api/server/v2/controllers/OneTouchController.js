import Util from '../../utils/Utils';
import database from '../../models';
import OneTouchRulesService from '../services/OneTouchRulesService';
import ApplicationError from '../../errors/ApplicationError';
import Logger from '../../utils/Logger';
import ErrorCodes from '../../errors/ErrorCodes';
import Responses from '../../utils/constants/Responses';
import OneTouchCommunicationService from '../services/OneTouchCommunicationConfigService';
import CLPUtils from '../../utils/Helper';
import path from 'path';
const { v4: uuidV4 } = require('uuid');
const fs = require('fs');
const lodash = require('lodash');
const uuid = require('uuid');

const util = new Util();

class OneTouchController {
  static async addOneTouchRule(req, res) {
    const {
      one_touch_rules, gateway_code, company_id,
    } = req.body;
    const { occupant_id, user_id,identity_id } = req;
    const onetouchRuleObjList = [];
    const{email} = req.headers
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
        const source_IP = req.source_IP; 
        const onetouchRuleObj = await OneTouchRulesService.addOneTouchRule(rule, rule_trigger_key, key, gateway_code, company_id,
          occupant_id, user_id, grid_order, communicationConfigs, name, keyList, cloudBridgeConfigs, source_IP,identity_id)
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
    const { occupant_id, company_id, user_id,identity_id } = req;
    let getOneTouchRule = null;
    const getOneTouchRuleTriggerKeyIdList = []; // 1st for loop
    const actionTriggerKeyList = []; // 2nd for loop
    let rulesActionTriggerKeyList = [];
    let deleteRecord = []; // delete record
    const source_IP = req.source_IP;
    const{email} = req.headers
    // const message = { message: Responses.responses.one_touch_multiple_update_message };
    let returnUpdatedRulesArray = [];
    let gateway = null
    if (one_touch_rules && one_touch_rules.length > 0) {
      const keyList = []
      await one_touch_rules.map(async (ele) => {
        keyList.push(ele.rule.key)
      });
      let promiseList = []
      for (const key in one_touch_rules) {
        const one_touch_rules_element = one_touch_rules[key];
        const { rule } = one_touch_rules_element;
        const { rule_trigger_key, grid_order } = one_touch_rules_element;
        const ruleKey = rule.key;
        const name = rule.name;
        const communicationConfigs = one_touch_rules_element.communication_configs;
        const cloudBridgeConfigs = one_touch_rules_element.cloud_bridge_configs;
        const source_IP = req.source_IP;
        promiseList.push(OneTouchRulesService.updateOneTouchRule(rule, rule_trigger_key, company_id, occupant_id,
            user_id, grid_order, communicationConfigs, ruleKey, name, keyList, cloudBridgeConfigs, source_IP,identity_id))
      }
      await Promise.all(promiseList).then(result=>{
        if(result.length>0){
          result.forEach(element => {
            returnUpdatedRulesArray.push(element.afterUpdateOneTouchRule)
            gateway = element.gateway
          });
        }
        }).catch((e) => {
          throw (e);
        });
        
        if(gateway){
          const oneTouchReferenceObj = await OneTouchRulesService.addDeviceReference(gateway.id);
          if (!oneTouchReferenceObj) {
            const err = ErrorCodes['330005'];
            throw err;
          }
          const ref = oneTouchReferenceObj.id;
          const host = process.env.SERVICE_API_HOST;
          const url = `https://${host}/api/v1/one_touch/gateway_rules?ref=${ref}`;
          await OneTouchRulesService.publishJsonUrl(company_id, gateway.device_code, url);
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
    const { occupant_id, user_id,identity_id } = req;
    const { isAdmin } = req.header;
    const{email} = req.headers
    const onetouchRulesObj = await OneTouchRulesService.getOneTouchRules(gateway_code, networkwifimac, occupant_id, user_id, isAdmin,identity_id)
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
    const source_IP = req.source_IP;
    const onetouchRuleObj = await OneTouchRulesService.deleteOneTouchRule(rule_trigger_key, company_id, occupant_id, user_id, key, source_IP)
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

    if(process.env.ALLOW_WITHOUT_OCCUPANT == true || process.env.ALLOW_WITHOUT_OCCUPANT == "true"){
      const clpContent =  CLPUtils.clpConvert(gatewayOneTouchRules); 
      let filename = "onetouch_rules"+uuidV4()+".clp"
      const filePath = path.join(__dirname, filename);
      fs.writeFileSync(filePath, clpContent, "utf8");
      res.download(filePath, filename, (err) => {
        if (err) {
          const error = ErrorCodes['330016'];
          console.error("Error sending CLP file:", err);
          res.status(422).send("Error downloading file");
          throw error;
        }
        fs.unlinkSync(filePath);
      });
    }else{
      res.status(200).json(gatewayOneTouchRules);
    }


  }

  static async updateRuleGroups(req, res) {
    const ruleTriggerKey = req.body.rule_trigger_key;
    const { key } = req.body;
    const ruleGroupIds = req.body.rule_group_ids;
    const occupantId = req.occupant_id;
    const companyId = req.body.company_id;
    const userId = req.user_id;
    const source_IP = req.source_IP;
    const updateRuleGroups = await OneTouchRulesService.updateRuleGroups(ruleTriggerKey,
      ruleGroupIds, occupantId, companyId, userId, key, source_IP)
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
          }
          const rule_trigger_key = null;
          promiseList.push(OneTouchRulesService.deleteOneTouchRule(rule_trigger_key, company_id, occupant_id, user_id, rulKey, req.source_IP));
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
