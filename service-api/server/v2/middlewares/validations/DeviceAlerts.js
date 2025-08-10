import { body, query } from 'express-validator';

const updateDeviceAlert = () => [
  body('alert_id', 'alert_id missing').exists().not().isEmpty()
    .isUUID(),
];

export {
  updateDeviceAlert,
};
