import { check, oneOf } from 'express-validator';

const Entities = [
  'Permissions',
  'Locations',
  'Companies',
  'CorePermissions',
  'Addresses',
  'CorePermissionMappings',
  'Invitations',
  'LocationTypes',
  'Users',
  'LocationPermissions',
];

export const createActivityConfigRules = () => [
  oneOf([
    check('entity').isIn(Entities),
  ]),
];

export default createActivityConfigRules;
