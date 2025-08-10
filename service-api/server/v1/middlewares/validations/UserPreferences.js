import { body } from 'express-validator';

const userPreferenceRules = () => [
  body('time_format', 'time_format missing').exists().isString().not()
    .isEmpty(),
  body('date_format', 'date_format missing').exists().isString().not()
    .isEmpty(),
  body('temperature_format', 'temperature_format missing').exists().isString().not()
    .isEmpty(),
  body('timezone_format', 'timezone_format missing').exists().isString().not()
    .isEmpty(),
  body('country', 'country missing').exists().isString().not()
    .isEmpty(),
];
export {
  // eslint-disable-next-line import/prefer-default-export
  userPreferenceRules,
};
