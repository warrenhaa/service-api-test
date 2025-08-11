import Util from '../../utils/Utils';
import PreDefinedRulesService from '../services/PreDefinedRulesService';

const uuid = require('uuid');

const util = new Util();

class PreDefinedController {
  static async addPreDefinedRule(req, res) {
    const {
      rule, action_code, gateway_id, company_id, source_device_id, target_device_id,
    } = req.body;
    const { user_id } = req;
    const key = uuid.v4();
    rule.key = key;
    const source_IP = req.source_IP;
    const preDefinedRuleObj = await PreDefinedRulesService.addPreDefinedRule(rule, action_code, gateway_id, company_id, source_device_id, target_device_id, user_id, source_IP)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, preDefinedRuleObj);
    return util.send(req, res);
  }

  static async deletePreDefinedRule(req, res) {
    const { user_id } = req;
    const { id } = req.query;
    const { company_id } = req.body;
    const source_IP = req.source_IP;
    const preDefinedRuleObj = await PreDefinedRulesService.deletePreDefinedRule(id, company_id, user_id, source_IP)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, preDefinedRuleObj);
    return util.send(req, res);
  }
}

export default PreDefinedController;
