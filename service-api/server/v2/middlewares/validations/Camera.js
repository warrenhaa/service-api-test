import { query } from 'express-validator';

const deleteCamera = () => [
  query('camera_id', 'camera_id missing').exists().not().isEmpty()
];

const Entities = [
  'asc',
  'desc',
];
const getConnectionHistory = () => [
  query('camera_id', 'device_code missing').exists().isString().not().isEmpty(),
  query('property_name', 'property_name missing').optional().isString().not().isEmpty(),
  query('start_date', 'start_date missing').exists().not().isEmpty(),
  query('start_date', 'invalid start_date').matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2})?$/),
  query('end_date', 'end_date missing').exists().not().isEmpty(),
  query('end_date', 'invalid end_date').matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2})?$/),
  query('order', 'invalid value for order').optional().isString(),
  query('order', 'invalid value for order').optional().isIn(Entities),
];

export {
  deleteCamera, getConnectionHistory
};
