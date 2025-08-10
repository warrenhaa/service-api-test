import { body, query, oneOf } from 'express-validator';

const addSingleControl = () => [
  body('name', 'name missing').exists().isString().not()
    .isEmpty(),
  body('gateway_id', 'gateway_id missing').exists().isUUID().not()
    .isEmpty(),
  body('default_device_id', 'default_device_id smissing').exists().isUUID().not()
    .isEmpty(),
  body('devices', 'devices array missing').exists().isArray(),
  body('devices', 'invalid devices array').exists().isArray().isUUID(),

];
const updateSingleControl = () => [
  body('id', 'id missing').exists().isUUID().not()
    .isEmpty(),
  body('name', 'name missing').exists().isString().not()
    .isEmpty(),
  body('gateway_id', 'gateway_id missing').exists().isUUID().not()
    .isEmpty(),
  body('default_device_id', 'default_device_id smissing').exists().isUUID().not()
    .isEmpty(),
  body('devices', 'devices array missing').exists().isArray(),
  body('devices', 'invalid devices array').exists().isArray().isUUID(),
];

const getSingleControl = () => [
  query('single_control_id', 'single_control_id missing or Invalid Value').exists().isUUID(),
];
const deleteSingleControl = () => [
  query('single_control_id', 'single_control_id missing or Invalid Value').exists().isUUID(),
];
const getGatewaySingleControls = () => [
  oneOf( // <-- one of the following must exist
    [
      query('gateway_id', 'gateway_id missing or Invalid Value').exists().isUUID().not()
        .isEmpty(),
      query('gateway_code', 'gateway_code missing').exists().not()
        .isEmpty(),
      query('networkwifimac', 'networkwifimac missing').exists().not().isEmpty(),
    ],
  ),
];

export {
  addSingleControl, updateSingleControl, getSingleControl, getGatewaySingleControls, deleteSingleControl,
};
