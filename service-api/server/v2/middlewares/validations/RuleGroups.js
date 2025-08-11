import { body, query, oneOf } from 'express-validator';

const addRuleGroups = () => [
  body('name', 'name missing').exists().isString().not()
    .isEmpty(),
  body('icon', 'icon missing').exists().isString().not()
    .isEmpty(),
  body('is_enable', 'is_enable missing').optional().isBoolean(),
  body('rules', 'rules missing').optional().isArray(),
  body('rules.*.key', 'key missing or Invalid Value').exists().isString().not()
    .isEmpty(),
    oneOf( // <-- one of the following must exist
      [
  body('gateway_id', 'gateway_id missing or Invalid Value').exists().isUUID().not()
    .isEmpty(),
    body('gateway_code', 'gateway_code missing').exists().not()
        .isEmpty(),
      ])
];

const updateRuleGroups = () => [
  body('id', 'id missing').exists().isUUID().not()
    .isEmpty(),
  body('rules', 'rules missing').optional().isArray(),
  body('rules.*.key', 'key missing or Invalid Value').exists().isString().not()
    .isEmpty(),
];

const deleteRuleGroups = () => [
  query('rule_group_id', 'rule_group_id missing').exists().isUUID().not()
    .isEmpty(),
];

const getAllRuleGroups = () => [
  oneOf( // <-- one of the following must exist
    [
      query('gateway_id', 'gateway_id missing').exists().isUUID().not()
        .isEmpty(),
      query('gateway_code', 'gateway_code missing').exists().not()
        .isEmpty(),
      query('networkwifimac', 'networkwifimac missing').exists().not().isEmpty(),
    ],
  ),
];

const getRuleGroups = () => [
  query('rule_group_id', 'rule_group_id missing').exists().isUUID().not()
    .isEmpty(),
];

export {
  getRuleGroups, getAllRuleGroups, addRuleGroups, updateRuleGroups, deleteRuleGroups,
};
