import { buildCheckFunction } from 'express-validator';

const checkBodyAndQuery = buildCheckFunction(['body', 'query', 'params']);

const modelCreateRule = () => [
  checkBodyAndQuery('name').exists(),
  checkBodyAndQuery('description').exists(),
];
const modelEditRule = () => [
  checkBodyAndQuery('model_id').exists().isUUID(),
];
const modelDeleteRule = () => [
  checkBodyAndQuery('id').exists().isUUID(),
];
export { modelCreateRule, modelEditRule, modelDeleteRule };
