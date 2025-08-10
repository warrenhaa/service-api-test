import { body, query, oneOf } from 'express-validator';
import ErrorCodes from '../../../errors/ErrorCodes';

const uuid = require('uuid');

const addOccupantsGroupsRule = () => [
  body('item_id', 'item_id missing or Invalid Value').exists().isUUID().not()
    .isEmpty(),
  body('devices', 'devices missing').exists().isArray(),
  body('devices', 'Invalid devices').exists().isArray().isUUID(),
  body('name', 'name missing').exists().isString().not()
    .isEmpty(),
  body('type', 'type missing').exists().isString().not()
    .isEmpty(),
];
const updateOccupantsGroupsRule = () => [
  query('id', 'gateway_id missing or Invalid Value').exists().isUUID().not()
    .isEmpty(),
  body('name', 'name missing').exists().isString().not()
    .isEmpty(),
];

const validateArrayUUID = function (req, res, next) {
  const { devices } = req.body;
  const errorStack = [];
  if (devices instanceof Array) {
    devices.forEach((id) => {
      if (!uuid.validate(id)) {
        errorStack.push(`${id} is not uuid`);
      }
    });
  }
  if (errorStack.length > 0) {
    const err = {};
    err.stack = errorStack;
    const customError = ErrorCodes['160053'];
    const code = customError.statusCode;
    res.setHeader('x-response-code', customError.responseCode);
    return res.status(code).send({
      request_id: req.request_id,
      message: customError.message,
    });
  }
  return next();
};

const addOccupantsGroupDevicesRule = () => [
  body('group_id', 'group_id missing or Invalid Value').exists().isUUID().not()
    .isEmpty(),
  body('devices', 'devices missing').exists().isArray(),
  body('devices', 'Invalid devices').exists().isArray().isUUID(),
];
const deleteOccupantsGroupDevicesRule = () => [
  body('group_id', 'group_id missing or Invalid Value').exists().isUUID().not()
    .isEmpty(),
  body('devices', 'devices missing').exists().isArray(),
  body('devices', 'Invalid devices').exists().isArray().isUUID(),
];

const OccupantsGroupsRule = () => [
  query('id', 'id missing or Invalid Value').exists().isUUID(),
];
const putOccupantsGroupsRule = () => [

  body('id', 'id missing or Invalid Value').exists().isUUID(),
  body('name', 'name missing').optional().isString().not()
    .isEmpty(),
  body('devices', 'devices missing').optional().isArray(),
  body('devices', 'Invalid devices').optional().isArray().isUUID(),

];

// eslint-disable-next-line import/prefer-default-export
export {
  addOccupantsGroupsRule, OccupantsGroupsRule, putOccupantsGroupsRule,
  updateOccupantsGroupsRule, addOccupantsGroupDevicesRule, deleteOccupantsGroupDevicesRule,
  validateArrayUUID,
};
