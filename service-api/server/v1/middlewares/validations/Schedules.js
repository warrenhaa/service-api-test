import {
  body, query, param, oneOf,
} from 'express-validator';

const getSchedules = () => [
  param('id', 'id missing').exists().isUUID().not()
    .isEmpty(),
];

const getAllSchedules = () => [
  oneOf( // <-- one of the following must exist
    [
      query('device_id', 'device_id is missing').exists().isUUID().not()
        .isEmpty(),
      query('device_code', 'device_id is missing').exists().not()
        .isEmpty(),
      [query('euid', 'euid is missing').exists().not().isEmpty(),
      query('networkwifimac', 'networkwifimac is missing').exists().not().isEmpty(),
      ],
    ],
  ),
];

const getDeviceSchedules = () => [
  query('ref', 'ref missing').exists().isUUID().not()
    .isEmpty(),
];

const addSchedules = () => [
  body('schedules', 'schedules array missing').exists().isArray().not()
    .isEmpty(),
  body('schedules.*.action', 'action is missing').exists().isArray(),
  oneOf( // <-- one of the following must exist
    [
      body('device_id', 'device_id is missing').exists().isUUID().not()
        .isEmpty(),
      [body('euid', 'euid is missing').exists().not().isEmpty(),
      body('networkwifimac', 'networkwifimac is missing').exists().not().isEmpty(),
      ],
    ],
  ),
];

const updateDuplicateSchedules = () => [
  body('from_device_id', 'from_device_id is missing').exists().isUUID().not()
    .isEmpty(),
  body('to_device_ids', 'to_device_ids array missing').exists().isArray().not()
    .isEmpty(),
];
const enableDeviceSchedules = () => [
  body('device_id', 'device_id is missing').exists().isUUID().not()
    .isEmpty(),
  body('is_enable', 'is_enable is  missing').exists().isInt().not()
    .isEmpty(),
  body('property_name', 'property_name is missing').exists().not().isEmpty()
];

const updateSchedules = () => [
  body('schedules', 'schedules array missing').exists().isArray().not()
    .isEmpty(),
  body('schedules.*.id', 'id is missing').exists().isUUID().not()
    .isEmpty(),
  body('schedules.*.schedule', 'schedule is missing').exists().isObject().not()
    .isEmpty(),
  body('schedules.*.schedule.action', 'action is missing').exists().isArray(),
  oneOf( // <-- one of the following must exist
    [
      body('device_id', 'device_id is missing').exists().isUUID().not()
        .isEmpty(),
      [body('euid', 'euid is missing').exists().not().isEmpty(),
      body('networkwifimac', 'networkwifimac is missing').exists().not().isEmpty(),
      ],
    ],
  ),
];

const deleteSchedules = () => [
  param('id', 'id missing').exists().isUUID().not()
    .isEmpty(),
];

const deleteAllSchedules = () => [
  oneOf( // <-- one of the following must exist
    [
      query('device_id', 'device_id is missing').exists().isUUID().not()
        .isEmpty(),
      [query('euid', 'euid is missing').exists().not().isEmpty(),
      query('networkwifimac', 'networkwifimac is missing').exists().not().isEmpty(),
      ],
    ],
  ),
];

export {
  getSchedules, getAllSchedules, getDeviceSchedules, addSchedules,
  updateDuplicateSchedules, updateSchedules, deleteSchedules, deleteAllSchedules, enableDeviceSchedules
};
