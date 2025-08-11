import { body, query, oneOf } from 'express-validator';
import database from "../../../models";
import ErrorCodes from "../../../errors/ErrorCodes";
import Util from '../../../utils/Utils';
const util = new Util();

const oneTouchPhoneNumberArrayRule = (req, res, next) => {
  const { request_id } = req;
  const { one_touch_rules } = req.body;
  let msg = null;
  if (one_touch_rules && one_touch_rules.length > 0) {
    for (const element in one_touch_rules) {
      const single_element = one_touch_rules[element];
      const communicationConfigsArray = single_element.communication_configs;

      if (communicationConfigsArray && communicationConfigsArray.length > 0) {
        for (const key in communicationConfigsArray) {
          const element = communicationConfigsArray[key];
          const { phone_numbers } = element;
          const { message } = element;
          if (phone_numbers && phone_numbers.length > 0) {
            for (const phone_number of phone_numbers) {
              if( phone_number.length == 0 || !phone_number.startsWith('+')) {
                msg = 'phone_number is invalid or country code is missing';
                break;
              }
            }

            if (!message) {
              msg = 'Text message is missing';
            }
          }
        }
      }
    }
  }

  if (msg) {
    return res.status(422).json({ code: 422, msg, request_id });
  }
  next();
};

const addOneTouchRule = () => [
  body('gateway_code', 'gateway_code missing').exists().not().isEmpty(),
  body('one_touch_rules', 'one_touch_rules array missing').exists().isArray().not()
    .isEmpty(),
  body('one_touch_rules.*.rule', 'rule is missing').exists().not().isEmpty(),
  body('one_touch_rules.*.rule', 'rule should be json object').isObject(),
  oneOf([
    body('one_touch_rules.*.rule_trigger_key', 'rule_trigger_key is missing').exists().not().isEmpty(),
    body('one_touch_rules.*.rule.key', 'key is missing').exists().not().isEmpty(),
  ]),
  body('one_touch_rules.*.rule.name', 'name is missing').exists().isString().not().isEmpty(),
  body('one_touch_rules.*.grid_order', 'grid_order is missing').optional().isString().not()
    .isEmpty(),
  body('one_touch_rules.*.communication_configs', 'communication_configs array missing').optional().isArray(),
  body('one_touch_rules.*.communication_configs.*.action_trigger_key', 'action_trigger_key is missing').exists().isString().notEmpty(),
  body('one_touch_rules.*.communication_configs.*.emails', 'Invalid email').optional().isArray(),
  body('one_touch_rules.*.communication_configs.*.phone_numbers', 'Invalid phone_number').optional().isArray(),
];

const updateOneTouchRule = () => [
  body('rule', 'rule missing').exists().not().isEmpty(),
  body('rule', 'rule should be json object').isObject(),
  oneOf([
    body('rule_trigger_key', 'rule_trigger_key is missing').exists().not().isEmpty(),
    body('key', 'key is missing').exists().not().isEmpty(),
  ]),
];

const updateOneTouchRules = () => [
  body('one_touch_rules', 'one_touch_rules array missing').exists().isArray().not()
    .isEmpty(),
  body('one_touch_rules.*.rule', 'rule is missing').exists().isObject().not()
    .isEmpty(),
  oneOf([
    body('one_touch_rules.*.rule_trigger_key', 'rule_trigger_key is missing').exists().not().isEmpty(),
    body('one_touch_rules.*.rule.key', 'key is missing').exists().not().isEmpty(),
  ]),
  body('one_touch_rules.*.rule.name', 'name is missing').exists().isString().not().isEmpty(),
  body('one_touch_rules.*.grid_order', 'grid_order is missing').optional().isString().not()
    .isEmpty(),
  body('one_touch_rules.*.communication_configs', 'communication_configs array missing').optional().isArray(),
  body('one_touch_rules.*.communication_configs.*.action_trigger_key', 'action_trigger_key is missing').exists().isString().notEmpty(),
  body('one_touch_rules.*.communication_configs.*.emails', 'Invalid email').optional().isArray(),
  body('one_touch_rules.*.communication_configs.*.phone_numbers', 'Invalid phone_number').optional().isArray(),
];

const deleteOneTouchRule = () => [
  oneOf([
    query('rule_trigger_key', 'rule_trigger_key is missing').exists().not().isEmpty(),
    query('key', 'key is missing').exists().not().isEmpty(),
  ]),
];
const deleteMultipleOneTouchRule = () => [
  body('keys', 'keys array is missing').exists().not().isEmpty()
    .isArray(),
];

const getOneTouchRule = () => [
  oneOf([
    query('rule_trigger_key', 'rule_trigger_key is missing').exists().not().isEmpty(),
    query('key', 'key is missing').exists().not().isEmpty(),
  ]),
];

const getOneTouchRules = () => [
  oneOf( // <-- one of the following must exist
    [
      query('gateway_code', 'gateway_code missing').exists().not().isEmpty(),
      query('networkwifimac', 'networkwifimac missing').exists().not().isEmpty(),
    ],
  ),
];
const getGatewayOneTouchRules = () => [
  query('ref', 'ref missing').exists().not().isEmpty(),
];

const ruleGroupsRules = () => [
  oneOf([
    body('rule_trigger_key', 'rule_trigger_key is missing').exists().not().isEmpty(),
    body('key', 'key is missing').exists().not().isEmpty(),
  ]),
  body('rule_group_ids', 'Rule group ids missing / Invalid rule group ids').exists().isArray(),
];

const uniqueActionTriggerKey = async (req, res, next) => {
  const {one_touch_rules} = req.body;
  let trigger_key = [];

  if (one_touch_rules && one_touch_rules.length > 0) {
    for (const element in one_touch_rules) {
      const oneTouchRule = one_touch_rules[element];
      const communicationConfigs = oneTouchRule.communication_configs;
      const error = ErrorCodes[330014];

      if (communicationConfigs && communicationConfigs.length > 0) {
        for (const key in communicationConfigs) {
          const data = communicationConfigs[key];
          const {action_trigger_key} = data;
          //make sure it unique in input
          if (trigger_key.includes(action_trigger_key)) {
            return util.sendError(req, res, error);
          } else {
            trigger_key.push(action_trigger_key);
          }

          //check unitque in db
          const communicationRecordExist = await database.one_touch_communication_configs.findOne({
            where: { action_trigger_key },
            raw: true,
          });

          if (communicationRecordExist) {
            return util.sendError(req, res, error);
          }

        }
      }
    }
  }
  next();
};



export {
  addOneTouchRule, updateOneTouchRule,
  deleteOneTouchRule, getOneTouchRule,
  getOneTouchRules, getGatewayOneTouchRules,
  updateOneTouchRules, ruleGroupsRules, deleteMultipleOneTouchRule,
  oneTouchPhoneNumberArrayRule, uniqueActionTriggerKey,
};
