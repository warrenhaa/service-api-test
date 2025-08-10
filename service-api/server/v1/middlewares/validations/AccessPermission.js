import { body, buildCheckFunction, oneOf } from 'express-validator';

const checkBodyAndQuery = buildCheckFunction(['body', 'query', 'params']);

export const createPermissionFromInviteRules = () => [
  body('user_id').exists(),
  checkBodyAndQuery('user_id').isUUID(),
];

export const createPermissionRules = () => [
  oneOf([
    body('permissions.core_permissions').exists(),
    body('permissions.site_permissions').exists(),
  ]),
];

export const locationPermissionDeletionRules = () => [
  body('user_id').exists(),
  body('location_id').exists(),
  checkBodyAndQuery('user_id').isUUID(),
  checkBodyAndQuery('location_id').isUUID(),
];
