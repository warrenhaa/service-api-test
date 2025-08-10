import { body } from 'express-validator';

const createLocationTypesRules = () => [
  body('name').isString(),
  body('container_id').exists(),
  body('can_have_devices').isBoolean(),
  body('is_address_applicable').isBoolean(),
  body('is_location_map_applicable').isBoolean(),
];

export default createLocationTypesRules;
