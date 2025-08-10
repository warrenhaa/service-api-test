import { query } from 'express-validator';

const getJobRule = () => [
  query('job_id', 'job id missing').exists().isUUID(),
];
export {
  getJobRule,
};
