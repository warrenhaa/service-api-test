import { param } from 'express-validator';

const uuidRules = () => [
  param('id').isUUID(),
];

export default uuidRules;
