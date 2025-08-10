import { body, oneOf } from 'express-validator';

const addressRules = () => [
  oneOf([
    body('line_1').exists(),
    body('line_2').exists(),
    body('line_3').exists(),
    body('city').exists(),
    body('state').exists(),
    body('country').exists(),
    body('zip_code').exists(),
    body('geo_location').exists(),
  ]),
];

export default addressRules;
