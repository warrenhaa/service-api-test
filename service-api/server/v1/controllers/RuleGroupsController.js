import Util from '../../utils/Utils';
import RuleGroupsService from '../services/RuleGroupsService';

const util = new Util();

class RuleGroupsController {
  static async getRuleGroups(req, res) {
    const { rule_group_id } = req.query;
    const { company_id } = req.body;
    const ruleGroupsObj = await RuleGroupsService.getRuleGroups(rule_group_id, company_id)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, ruleGroupsObj);
    return util.send(req, res);
  }

  static async getAllRuleGroups(req, res) {
    const { gateway_id, networkwifimac, gateway_code } = req.query;
    const { company_id } = req.body;
    const { occupant_id, user_id,identity_id } = req;
    const { isAdmin } = req.header;
    const { email } = req.headers;
    const ruleGroupsObj = await RuleGroupsService.getAllRuleGroups(gateway_id, company_id, networkwifimac, occupant_id, user_id, gateway_code, isAdmin,identity_id)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, ruleGroupsObj);
    return util.send(req, res);
  }

  static async addRuleGroups(req, res) {
    const {
      name, icon, rules, gateway_id,gateway_code, company_id, is_enable,
    } = req.body;
    const { occupant_id,identity_id } = req;
    const { user_id } = req;
    const {email } = req.headers;
    const source_IP = req.source_IP;
    const ruleGroupsObj = await RuleGroupsService.addRuleGroups(name, icon, rules, gateway_id, company_id, user_id, occupant_id, is_enable, source_IP,gateway_code,identity_id)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, ruleGroupsObj);
    return util.send(req, res);
  }

  static async updateRuleGroups(req, res) {
    const { body } = req;
    const { user_id, occupant_id } = req;
    const source_IP = req.source_IP;
    const ruleGroupsObj = await RuleGroupsService.updateRuleGroups(body, user_id, occupant_id, source_IP)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, ruleGroupsObj);
    return util.send(req, res);
  }

  static async deleteRuleGroups(req, res) {
    const { rule_group_id } = req.query;
    const { company_id } = req.body;
    const { user_id, occupant_id } = req;
    const source_IP = req.source_IP;
    const ruleGroupsObj = await RuleGroupsService.deleteRuleGroups(rule_group_id, company_id, user_id, occupant_id, source_IP)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, ruleGroupsObj);
    return util.send(req, res);
  }
}

export default RuleGroupsController;
