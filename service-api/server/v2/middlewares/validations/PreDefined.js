import { body, query } from 'express-validator';

const addPreDefinedRule = () => [
  body('rule', 'rule missing').exists().not().isEmpty(),
  body('rule', 'rule should be json object').isObject(),
  body('action_code', 'action_code missing').exists().not().isEmpty(),
  body('gateway_id', 'gateway_id missing').exists().not().isEmpty()
    .isUUID(),
  body('source_device_id', 'source_device_id missing').exists().not().isEmpty()
    .isUUID(),
  body('target_device_id', 'target_device_id missing').exists().not().isEmpty()
    .isUUID(),
];

const deletePreDefinedRule = () => [
  query('id', 'id missing').exists().not().isEmpty(),
];

export {
  addPreDefinedRule, deletePreDefinedRule,
};
