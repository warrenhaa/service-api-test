import LogGenerator from '../../../utils/LogGenerator';
import Logger from '../../../utils/Logger';
import errorCodes from '../../../errors/ErrorCodes';
import ApplicationError from '../../../errors/ApplicationError';
import asyncErrorHandler from '../AsyncErrorHandler';

const { body, param, validationResult } = require('express-validator');
const { buildCheckFunction, oneOf } = require('express-validator');

const checkBodyAndQuery = buildCheckFunction(['body', 'query', 'params']);

export const creatAccessPermissionRule = () => [
  body('user_id').exists(),
  checkBodyAndQuery('user_id').isUUID(),
];

export const createAccessPermissionValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  res.setHeader('x-response-code', 'APC_IID');
  return res.status(422).json({});
};

export const accessPermissionIdRule = () => [
  body('id').exists(),
  checkBodyAndQuery('id').isUUID(),
];

export const accessPermissionParamIdRules = () => [
  param('id').exists(),
  checkBodyAndQuery('id').isUUID(),
];

export const accessPermissionUpdateRules = () => [
  body('user_id').exists(),
  checkBodyAndQuery('user_id').isUUID(),
  checkBodyAndQuery('permissions').exists(),
  oneOf([
    [body('permissions.core_permissions').exists()], [body('permissions.site_permissions').exists()]]),
];

export const accessPermissionIdValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  res.setHeader('x-response-code', 'APC_IID');
  return res.status(422).json({});
};

export const userBodyValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  res.setHeader('x-response-code', 'USC_IID');
  return res.status(422).json({});
};

export const validation = asyncErrorHandler((req, res, next) => {
  const errors = validationResult(req);
  const { request_id } = req;
  if (errors.isEmpty()) {
    return next();
  }
  let { msg } = errors.errors[0];
  if(errors.errors[0].nestedErrors && errors.errors[0].nestedErrors.length> 0){
    errors.errors[0].nestedErrors.forEach(element=>{
      if(msg != element.msg){
        msg = element.msg
      }
    })
  }
  const error = errorCodes['440000'];
  
  error.message = msg;
  error.request_id = request_id;
  throw new ApplicationError(error);
});
