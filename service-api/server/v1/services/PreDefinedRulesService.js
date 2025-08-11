import { isDate } from 'lodash';
import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import OneTouchRulesService from './OneTouchRulesService';
import Responses from '../../utils/constants/Responses';

class PreDefinedRulesService {
  static async addPreDefinedRule(rule, action_code, gateway_id, company_id, source_device_id, target_device_id, user_id, source_IP) {
    const ids = [];
    ids.push(source_device_id, target_device_id);
    const gateway = await database.devices.findOne({
      where: { id: gateway_id },
      raw: true,
    }).then((result) => result);
    const device_presence = await database.devices.findAll({
      where: {
        id: ids,
        gateway_id,
      },
      raw: true,
    });
    if (device_presence.length !== 2) {
      const err = ErrorCodes['350006'];
      throw err;
    }
    const gateway_code = gateway.device_code;
    if (!gateway) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    const preDefinedRuleObj = await database.predefined_rules.create({
      rule, action_code, source_device_id, target_device_id, gateway_id: gateway.id, company_id,
    }).then((result) => result)
      .catch((error) => {
        const err = ErrorCodes['350000'];
        throw err;
      });

    if (!preDefinedRuleObj) {
      const err = ErrorCodes['350000'];
      throw err;
    }
    // creeting reference in one_touch_rule_reference table
    const preDefinedReferenceObj = await OneTouchRulesService.addDeviceReference(gateway.id);
    if (!preDefinedReferenceObj) {
      const err = ErrorCodes['350005'];
      throw err;
    }
    const ref = preDefinedReferenceObj.id;
    const host = process.env.SERVICE_API_HOST;
    const url = `https://${host}/api/v1/one_touch/gateway_rules?ref=${ref}`;
    // creates a json object - using existing method
    await OneTouchRulesService.publishJsonUrl(company_id, gateway_code, url);
    // creates data to add in activitylog
    const obj = {
      new: preDefinedRuleObj,
      old: {},
    };
    const placeholdersData = {};
    ActivityLogs.addActivityLog(Entities.predefined_rules.entity_name,
      Entities.predefined_rules.event_name.added, obj, Entities.notes.event_name.added, preDefinedRuleObj.id,
      company_id, user_id, null, placeholdersData, source_IP);
    return {
      message: Responses.responses.predefined_add_message,
    };
  }

  static async deletePreDefinedRule(id, company_id, user_id, source_IP) {
    const preDefinedRule = await database.predefined_rules.findOne({
      where: { id },
    }).then((result) => result);
    if (!preDefinedRule) {
      const err = ErrorCodes['350002'];
      throw err;
    }
    const { gateway_id } = preDefinedRule;
    const gateway = await database.devices.findOne({
      where: { id: gateway_id },
    });
    const gateway_code = gateway.device_code;

    const preDefinedRuleObj = await database.predefined_rules.destroy({
      where: { id },
      returning: true,
    }).then((result) => result)
      .catch(() => {
        const err = ErrorCodes['350004'];
        throw err;
      });
    if (!preDefinedRuleObj) {
      const err = ErrorCodes['350004'];
      throw err;
    }
    // creeting reference in one_touch_rule_reference table and publishing the gateway
    const preDefinedReferenceObj = await OneTouchRulesService.addDeviceReference(gateway_id);
    if (!preDefinedReferenceObj) {
      const err = ErrorCodes['350005'];
      throw err;
    }
    const ref = preDefinedReferenceObj.id;
    const host = process.env.SERVICE_API_HOST || 'dev-service.ctiotsolution.com';
    const url = `https://${host}/api/v1/one_touch/gateway_rules?ref=${ref}`;
    // creates a json object - using existing method
    await OneTouchRulesService.publishJsonUrl(company_id, gateway_code, url);
    // creates data to add in activitylog
    const obj = {
      new: {},
      old: preDefinedRule,
    };
    const placeholdersData = {};
    ActivityLogs.addActivityLog(Entities.predefined_rules.entity_name,
      Entities.predefined_rules.event_name.deleted, obj, Entities.notes.event_name.deleted, preDefinedRule.id,
      company_id, user_id, null, placeholdersData, source_IP);
    return {
      message: Responses.responses.predefined_delete_message,
    };
  }
}

export default PreDefinedRulesService;
