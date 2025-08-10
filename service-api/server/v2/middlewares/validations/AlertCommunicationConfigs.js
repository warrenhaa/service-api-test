import { body, query, oneOf } from 'express-validator';

const addAlertCommunicationConfigsRule = () => [
  oneOf( // <-- one of the following must exist
    [
      body('device_code', 'device_code missing').exists().isString().not()
        .isEmpty(),
      body('device_id', 'device_id missing').exists().isUUID().not()
        .isEmpty(),
    ],
  ),
  body('alert_type', 'alert_type missing or Invalid Value').exists().isString().not()
    .isEmpty(),
  body('alert_message', 'alert_message missing or Invalid Value').exists().isString().not()
    .isEmpty(),
  body('sms_enabled', 'sms_enabled missing').exists().isBoolean().not()
    .isEmpty(),
  body('email_enabled', 'email_enabled missing').exists().isBoolean().not()
    .isEmpty(),
  body('notification_enabled', 'notification_enabled missing').exists().isBoolean().not()
    .isEmpty(),

];
const addMultipleAlertCommunicationConfigsRule = () => [
  body('alert_configs').exists().isArray(),
  oneOf( // <-- one of the following must exist
    [
      body('alert_configs.*.device_code', 'device_code missing').exists().isString().not()
        .isEmpty(),
      body('alert_configs.*.device_id', 'device_id missing').exists().isUUID().not()
        .isEmpty(),
    ],
  ),
  body('alert_configs.*.alert_type', 'alert_type missing or Invalid Value').exists().isString().not()
    .isEmpty(),
  body('alert_configs.*.alert_type', 'No special chracters are allowed in the alert_type').matches(/^[A-Za-z0-9 -_]+$/),
  body('alert_configs.*.alert_type').custom((value) => !/\s/.test(value))
    .withMessage('No spaces are allowed in the alert_type'),
  body('alert_configs.*.alert_type', 'alert_type exceeded the max character length 255').isLength({ max: 255 }),
  body('alert_configs.*.alert_message', 'alert_message missing or Invalid Value').exists().isString().not()
    .isEmpty(),
  body('alert_configs.*.alert_message', 'alert_message exceeded the max character length 255').isLength({ max: 255 }),
  body('alert_configs.*.sms_enabled', 'sms_enabled missing').exists().isBoolean().not()
    .isEmpty(),
  body('alert_configs.*.email_enabled', 'email_enabled missing').exists().isBoolean().not()
    .isEmpty(),
  body('alert_configs.*.notification_enabled', 'notification_enabled missing').exists().isBoolean().not()
    .isEmpty(),
];

const getAlertCommunicationConfigsRule = () => [
  oneOf( // <-- one of the following must exist
    [
      query('device_code', 'device_code missing or Invalid Value').exists().isString(),
      query('device_id', 'device_id missing or Invalid Value').exists().isUUID(),
    ],
  ),
];

// eslint-disable-next-line import/prefer-default-export
export {
  addAlertCommunicationConfigsRule, getAlertCommunicationConfigsRule,
  addMultipleAlertCommunicationConfigsRule,
};
