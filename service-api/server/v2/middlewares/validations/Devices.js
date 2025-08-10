import { body, query, oneOf } from 'express-validator';
import LogGenerator from '../../../utils/LogGenerator';
import Logger from '../../../utils/Logger';
import ErrorCodes from '../../../errors/ErrorCodes';

const { validationResult } = require('express-validator');
const uuid = require('uuid');

const createDeviceRules = (req, res, next) => {
  const { request_id } = req;
  const {
    type, mdns_id, bluetooth_id, device_code, model, gateway_id,
  } = req.body;
  let message = null;

  if (!req.headers['x-access-token']) {
    message = 'x-access-token type is missing';
  } else {
    if (!type) {
      message = 'type is missing';
    }
    if (type == 'gateway') {
      if (!mdns_id && !bluetooth_id) {
        message = 'mdns_id/bluetooth_id is missing';
      }
    } else if (!device_code) {
      message = 'device_code is missing';
    } else if (!model) {
      message = 'model is missing';
    } else if (!gateway_id) {
      message = 'gateway_id is missing';
    } else if (gateway_id) {
      if (!uuid.validate(gateway_id)) {
        message = 'invalid gateway_id';
      }
    }
  }
  if (message) {
    // Logger.error('validation-error', new LogGenerator().getJsonFormattedLog(req, res, err));
    return res.status(422).json({ code: 422, message, request_id });
  }
  next();
};
const createBulkDeviceRules = () => [
  body('devices').exists().isArray(),
  body('devices.*.device_code').exists().isString().not().isEmpty(),
  body('devices.*.company_id').optional().isUUID(),
  body('devices.*.type').exists().isString().not().isEmpty(),
  body('devices.*.status').optional().isString(),
  body('devices.*.name').optional().isString(),
  body('devices.*.model').exists().isString().not().isEmpty(),
  body('devices.*.serial_number').optional().isString(),
  body('devices.*.mac_address').optional().isString(),
  body('devices.*.firmware_version').optional().isString(),
  body('devices.*.gateway_id').exists().isUUID().not().isEmpty(),
  body('devices.*.location_id').optional().isUUID(),
];
const updateBulkDeviceRules = () => [
  body('devices').exists().isArray(),
  body('devices.*.id').exists().isUUID(),
  body('devices.*.device_code').exists().isString().not().isEmpty(),
  body('devices.*.company_id').optional().isUUID(),
  body('devices.*.type').exists().isString().not().isEmpty(),
  body('devices.*.status').optional().isString(),
  body('devices.*.name').optional().isString(),
  body('devices.*.model').exists().isString().not().isEmpty(),
  body('devices.*.serial_number').optional().isString(),
  body('devices.*.mac_address').optional().isString(),
  body('devices.*.firmware_version').optional().isString(),
  body('devices.*.gateway_id').exists().isUUID().not().isEmpty(),
  body('devices.*.location_id').optional().isUUID(),
];


const getDeviceShadows = () => [
  body('device_codes', 'device_codes missing').exists().isArray()
];


const getConnectionHistory = () => [
  query('device_code', 'device_code missing').exists().isString().not().isEmpty(),
  query('property_name', 'property_name missing').exists().isString().not().isEmpty(),
  query('property_value', 'property_value missing').optional().not().isEmpty(),
  query('start_date', 'start_date missing').exists().not().isEmpty(),
  query('start_date', 'invalid start_date').matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2})?$/),
  query('end_date', 'end_date missing').exists().not().isEmpty(),
  query('end_date', 'invalid end_date').matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2})?$/),
  query('type', 'type missing').optional().isString().not().isEmpty(),
  query('raw_data', 'invalid raw_data').optional().isBoolean(),
  query('page', 'invalid value for page').optional().isInt(),
  query('limit', 'invalid value for limit').optional().isInt(),
  query('order', 'invalid value for order').optional().isString(),
];
const getUserAnalytics = () => [
  query('device_code', 'device_code missing').exists().isString().not().isEmpty(),
  query('start_date', 'start_date missing').exists().not().isEmpty(),
  query('start_date', 'invalid start_date').matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
  query('end_date', 'end_date missing').exists().not().isEmpty(),
  query('end_date', 'invalid end_date').matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
  query('time_span', 'time_span missing').optional().isString().not().isEmpty(),
];
const deleteGatewayRules = () => [
  query('gateway_id', 'gateway_id missing').exists().not().isEmpty()
    .isUUID(),
  query('command', 'command is missing').optional().isInt(),
];

const checkGatewayExistRules = () => [
  oneOf( // <-- one of the following must exist
    [
      body('mdns_id', 'mdns_id missing').exists().isString().not()
        .isEmpty(),
      body('bluetooth_id', 'bluetooth_id missing').exists().isString().not()
        .isEmpty(),
    ],
  ),
];

const gatewayCameraLink = () => [
  body('camera_device_ids', 'camera_device_ids missing or invalid').exists().isArray(),
  body('camera_device_ids.*', 'camera_device_ids must be UUIDs').isUUID(),
  body('gateway_id', 'gateway_id missing').exists(),
  body('gateway_id', 'gateway_id must be UUID').isUUID().not().isEmpty(),
];

const gatewayCameraPlanLink = () => [
  body('camera_device_id', 'camera_device_ids missing').exists().isUUID().not().isEmpty(),
  body('gateway_id', 'gateway_id is missing').exists().isUUID().not().isEmpty(),
  body('active', 'active is missing').exists(),
  body('active', '\'active\' must be boolean value').isBoolean().not().isEmpty(),
];

const gatewayCameraList = () => [
  oneOf( // <-- one of the following must exist
    [
      query('gateway_id', 'gateway_id missing').exists().isUUID().not().isEmpty(),
      query('gateway_code', 'gateway_code missing').exists().isString().not().isEmpty(),
    ],
  ),
];

const UploadFileCheck = () => [
  query('token', 'token missing').exists().isUUID().not()
    .isEmpty(),
  query('company_code', 'company_code is missing').exists().isString().not()
    .isEmpty(),
];

const SchedulesUploadFileCheck = () => [
  query('token', 'token missing').exists().isUUID().not()
    .isEmpty(),
  query('company_code', 'company_code is missing').exists().isString().not()
    .isEmpty(),
];

const deleteDeviceRules = () => [
  query('device_id', 'device_id missing').exists().not().isEmpty()
    .isUUID(),
];
const categoryAddRules = () => [
  body('model', 'model is missing').exists().isString().not().isEmpty(),
  body('category_id', 'category_id is missing').exists(),
  body('category_id', 'category_id must be an integer').exists().isInt().not().isEmpty(),
  body('name', 'name is missing').optional().isString().not().isEmpty(),
  body('device_class', 'device_class is missing').optional().isString().not().isEmpty(),
  body('data', 'data is missing').optional().isObject().not().isEmpty(),
];

const localCloudSyncupRules = () => [
  body('gateway_id', 'gateway_id is missing').exists().isString().not().isEmpty()
];

const DeviceValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const err = {};
  err.stack = errors;
  Logger.error('validation-error', new LogGenerator().getJsonFormattedLog(req, res, err));
  const customError = ErrorCodes['800009'];
  const code = customError.statusCode;
  res.setHeader('x-response-code', customError.responseCode);
  return res.status(code).send({ request_id: req.request_id });
};

const validateArrayUUID = function (req, res, next) {
  const { ids } = req.body;
  const errorStack = [];
  if (ids instanceof Array) {
    ids.forEach((id) => {
      if (!uuid.validate(id)) {
        errorStack.push(`${id} is not uuid`);
      }
    });
  }

  if (errorStack.length > 0) {
    const err = {};
    err.stack = errorStack;
    Logger.error('validation-error', new LogGenerator().getJsonFormattedLog(req, res, err));
    const customError = ErrorCodes['900006'];
    const code = customError.statusCode;
    res.setHeader('x-response-code', customError.responseCode);
    return res.status(code).send({ request_id: req.request_id });
  }
  return next();
};

const validateUUID = () => [
  body('id').isUUID(),
];

export {
  createDeviceRules, DeviceValidation, validateArrayUUID, validateUUID,
  createBulkDeviceRules, updateBulkDeviceRules, getConnectionHistory, deleteGatewayRules,
  deleteDeviceRules, checkGatewayExistRules, UploadFileCheck, SchedulesUploadFileCheck, gatewayCameraLink,
  gatewayCameraList, gatewayCameraPlanLink, categoryAddRules, localCloudSyncupRules, getUserAnalytics, getDeviceShadows
};
