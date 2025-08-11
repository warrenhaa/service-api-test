import { buildCheckFunction, param, header } from 'express-validator';
import { isBoolean } from 'lodash';

const checkBodyAndQuery = buildCheckFunction(['body', 'query', 'params']);

const userBodyRule = () => [
  checkBodyAndQuery('cognito_id').exists(),
  checkBodyAndQuery('cognito_id').isUUID(),
];

const loginBodyRule = () => [
  checkBodyAndQuery('email', 'inavlid email address').exists().notEmpty().isString()
    .isEmail(),
  checkBodyAndQuery('password', 'password missing').exists().notEmpty().isString(),
  checkBodyAndQuery('password').custom((value) => !/\s/.test(value))
    .withMessage('No spaces are allowed in the password'),

];

const userCreateRule = () => [
  checkBodyAndQuery('cognito_id').exists(),
  checkBodyAndQuery('cognito_id').isUUID(),
  checkBodyAndQuery('invite_id').exists(),
  checkBodyAndQuery('invite_id').isUUID(),
  checkBodyAndQuery('identity_id').exists(),
];
const userAdminCreateRule = () => [
  checkBodyAndQuery('cognito_id').exists(),
  checkBodyAndQuery('cognito_id').isUUID(),
  checkBodyAndQuery('identity_id').exists(),
];

const userDeleteValidation = () => [
  param('id', 'id missing').exists().isUUID(),
  header('x-access-token', 'x-access-token missing').exists().not().isEmpty(),
];
const userIdRule = () => [param('id').exists().isUUID()];

export {
  userBodyRule, userCreateRule, userIdRule, userDeleteValidation, loginBodyRule, userAdminCreateRule
};
