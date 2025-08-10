import { body } from 'express-validator';

const createLocationsRules = () => [
  body('name').isString(),
  body('type_id').isUUID(),
  body('container_id').exists(),
];

export default createLocationsRules;
