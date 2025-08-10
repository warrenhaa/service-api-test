import { body, query } from 'express-validator';

const phoneNumberArrayRule = (req, res, next) => {
  const { request_id } = req;
  const { phone_numbers, message } = req.body;
  let msg = null;

  if (phone_numbers && phone_numbers.length > 0) {
    if (!message) {
      msg = 'Text message is missing';
    }
  }

  if (msg) {
    return res.status(422).json({ code: 422, msg, request_id });
  }
  next();
};

const getOneTouchCommunicationConfig = () => [
  query('one_touch_config_id', 'one_touch_config_id is missing').exists().isUUID().notEmpty(),
];

const addOneTouchCommunicationConfig = () => [
  body('one_touch_rule_id', 'one_touch_rule_id is missing').exists().isUUID().notEmpty(),
  body('action_trigger_key', 'action_trigger_key is missing').exists().isString().notEmpty(),
  body('emails', 'Invalid email').optional().isArray().isEmail(),
  body('phone_numbers', 'Invalid phone_number').optional().isArray(),
];

const updateOneTouchCommunicationConfig = () => [
  body('id', 'id is missing').exists().isUUID().notEmpty(),
  body('action_trigger_key', 'action_trigger_key missing').optional().isString().notEmpty(),
  body('message', 'Text message is missing').optional().isString().notEmpty(),
  body('emails', 'Invalid email').optional().isArray().isEmail(),
  body('phone_numbers', 'Invalid phone_number').optional().isArray(),
];

const deleteOneTouchCommunicationConfig = () => [
  query('one_touch_config_id', 'one_touch_config_id is missing').exists().isUUID().notEmpty(),
];
export {
  addOneTouchCommunicationConfig, updateOneTouchCommunicationConfig, deleteOneTouchCommunicationConfig, getOneTouchCommunicationConfig,
  phoneNumberArrayRule,
};
