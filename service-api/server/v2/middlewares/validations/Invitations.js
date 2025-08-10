import {
  body, oneOf, validationResult, query,
} from 'express-validator';
import LogGenerator from '../../../utils/LogGenerator';
import Logger from '../../../utils/Logger';
import ErrorCodes from '../../../errors/ErrorCodes';

export const validateParamEmail = () => [query('email').isEmail()];

export const sendInviteValidationRules = () => [body('email').isEmail()];

export const editInvitationPermission = () => [
  oneOf([
    body('permissions.core_permissions').exists(),
    body('permissions.site_permissions').exists(),
  ]),
];

export const editInvitationValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const err = {};
  err.stack = errors;
  Logger.error('validation-error', new LogGenerator().getJsonFormattedLog(req, res, err));
  const customError = ErrorCodes['200006'];
  res.setHeader('x-response-code', customError.responseCode);
  res.status(customError.statusCode).send({ request_id: req.request_id });
  return null;
};
