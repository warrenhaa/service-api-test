import {
  body, header, query, oneOf, buildCheckFunction,
} from 'express-validator';

import OccupantService from '../../services/OccupantService';
import CompaniesService from '../../services/CompaniesService';

const validatePhoneNumber = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const checkQuery = buildCheckFunction(['query']);

const validationForPhoneNumber = function (req, res, next) {
  return new Promise(async () => {
    const company_id = req.body.company_id;
    const company = await CompaniesService.getCompany(company_id).then((result) => (result)).catch((error) => {
      throw (error);
    });
    if (!company) {
      const err = ErrorCodes['000001'];
      throw (err);
    }
    let mobileVerificatnEnabled = false;
    if (company.configs && company.configs.mobile_verificatin_enabled) {
      mobileVerificatnEnabled = company.configs.mobile_verificatin_enabled;
    } else if (!company.configs || Object.keys(company.configs).length === 0 ||
      (company.configs && !company.configs.mobile_verificatin_enabled)) {
      mobileVerificatnEnabled = true;
    }
    if (mobileVerificatnEnabled == true) {
      let message = null;
      const { request_id } = req;
      const { phone_number } = req.body.attributes;
      if (phone_number != undefined) {
        let { country } = req.body;
        const occupant = await OccupantService.getOccupant(req.occupant_id);
        if (occupant.phone_number != phone_number) {
          if (country === undefined) {
            country = occupant.country;
          }
          if (validatePhoneNumber.isPossibleNumberString(phone_number)) {
            let phNo = validatePhoneNumber.parse(phone_number);
            phNo = phNo.values_;
            phNo = Object.values(phNo);
            const country_code = `+${phNo[0]}`;
            const countryForPhoneNumber = validatePhoneNumber.getRegionCodeForCountryCode(
              parseInt(country_code),
            );
            if ((country.toUpperCase()) !== countryForPhoneNumber.toUpperCase()) {
              message = 'Invalid country code for country';
            }
          } else {
            message = 'invalid phone_number value';
          }
        }
      }
      if (message) {
        return res.status(422).json({ code: 422, message, request_id });
      }
    }
    next();
  });
};

const validationForCountry = (req, res, next) => new Promise(async () => {
  const company_id = req.body.company_id;
  const company = await CompaniesService.getCompany(company_id).then((result) => (result)).catch((error) => {
    throw (error);
  });
  if (!company) {
    const err = ErrorCodes['000001'];
    throw (err);
  }
  let countryVerificatnEnabled = false;
  if (company.configs && company.configs.country_verificatin_enabled) {
    countryVerificatnEnabled = company.configs.country_verificatin_enabled;
  } else if (!company.configs || Object.keys(company.configs).length === 0 ||
    (company.configs && !company.configs.country_verification_enabled)) {
    countryVerificatnEnabled = true;
  }
  if (countryVerificatnEnabled == true) {
    let message = null;
    const { request_id } = req;
    const { country } = req.body;
    if (country !== undefined) {
      const countryCode = validatePhoneNumber.getCountryCodeForRegion(country);
      if (countryCode === 0) {
        message = 'invalid country value';
      }
    }
    if (message) {
      return res.status(422).json({ code: 422, message, request_id });
    }
  }
  next();
});

const isEmptybody = (req, res, next) => {
  let message = null;
  const reqBody = { ...req.body };
  delete reqBody.company_id;
  const { request_id } = req;
  if (Object.keys(reqBody).length === 0) {
    message = 'body is empty';
  }
  if (message) {
    return res.status(422).json({ code: 422, message, request_id });
  }
  next();
};

const Entities = [
  'gateway',
  'location',
  'camera_dashboard',
  'admin'
];
const accessLevels = [
  'O',
  'F',
  'G',
];

const createInvitatioRules = () => [
  body('email').exists().isString().not()
    .isEmpty(),
  body('location_ids', 'location_ids missing').optional().isArray(),
  body('location_ids', 'Invalid locations').optional().isArray().isUUID(),
];
const editInvitatioRules = () => [
  body('location_ids', 'location_ids missing').exists().isArray(),
  body('location_ids', 'Invalid locations').exists().isArray().isUUID(),
];

const editOccupantRules = () => [
  body('attributes.first_name', 'first_name has exceeded the max character length 30').optional()
    .isString()
    .isLength({ max: 30 }),
  body('attributes.first_name', 'first_name is empty').optional().isLength({ min: 1 }),
  body('attributes.first_name').custom((value) => !/\d/g.test(value))
    .withMessage('No digits are allowed in the first_name'),
  oneOf([
    [
      header('x-company-code').equals('purmo'),
      body('attributes.first_name').custom((value) => !/[`!@#$%^&*()_+\=\\[\]{};':"\\|,.<>\\/?~]/g.test(value))
        .withMessage('No special characters are allowed in the first_name'),
    ],
    [
      header('x-company-code').not().equals('purmo'),
      body('attributes.first_name').custom((value) => !/[`!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?~]/g.test(value))
        .withMessage('No special characters are allowed in the first_name'),
    ]
  ]),
  body('attributes.last_name', 'last_name has exceeded the max character length 30').optional()
    .isString()
    .isLength({ max: 30 }),
  body('attributes.last_name', 'last_name is empty').optional().isLength({ min: 1 }),
  body('attributes.last_name').custom((value) => !/\d/g.test(value))
    .withMessage('No digits are allowed in the last_name'),
  oneOf([
    [
      header('x-company-code').equals('purmo'),
      body('attributes.last_name').custom((value) => !/[`!@#$%^&*()_+\=\\[\]{};':"\\|,.<>\\/?~]/g.test(value)).withMessage('No special characters are allowed in the last_name'),
    ],
    [
      header('x-company-code').not().equals('purmo'),
      body('attributes.last_name').custom((value) => !/[`!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?~]/g.test(value))
        .withMessage('No special characters are allowed in the last_name'),
    ]
  ]),
  body('country', 'invalid country value').optional().isString().isLength({ min: 1 })

];

const occupantDeleteValidation = () => [
  oneOf( // <-- one of the following must exist
    [
      query('id', 'occupant id missing').exists().isUUID(),
      query('email', 'occupant email missing').exists().isEmail()
    ]
  ),
  header('x-access-token', 'x-access-token is missing').exists().not().isEmpty(),
];

const occupantCheckInRules = () => [
  body('occupant_invite_id').optional().isUUID(),
  body('occupant_id').optional().isUUID(),
  body('location_id').exists().isUUID().not()
    .isEmpty(),
  body('admin_identity_id').optional().isString(),
  header('x-access-token').exists().not().isEmpty(),
];
const occupantCheckOutRules = () => [
  body('occupant_invite_id').optional().isUUID(),
  body('occupant_id').optional().isUUID(),
  body('location_id').exists().isUUID().not()
    .isEmpty(),
  body('admin_identity_id').optional().isString(),
  header('x-access-token').exists().not().isEmpty(),
];
const occupantCreateRules = () => [
  body('email', 'invalid email value').exists().isString().not()
    .isEmpty()
    .isEmail(),
  body('first_name', 'first_name has exceeded the max character length 30').optional().isString().isLength({ max: 30 }),
  body('first_name', 'first_name is empty').optional().isLength({ min: 1 }),
  body('first_name', 'Value for first_name is invalid').optional(),
  body('cognito_id').optional().isString(),
  body('identity_id').exists().isString().not()
    .isEmpty(),
  body('invite_code').optional().isString(),
];
const occupantDeviceAlertRules = () => [
  query('id', 'occupant id missing').exists().isUUID(),
];

const occupantNotificationTokenUpdateValidation = () => [
  body('id', 'occupants notification tokens id is missing').exists().isUUID().notEmpty(),
  body('token', 'occupants notification tokens is invalid').optional().isString().notEmpty(),
  body('os', 'occupants notification os is invalid').optional().isString().notEmpty(),
  body('dnd', 'occupants notification dnd id is invalid').optional().isBoolean().notEmpty(),
  body('data', 'occupants notification data is invalid').optional().isObject(),
  body('data.camera_notification_enable', 'occupants notification data.camera_notification_enable is invalid').optional().isBoolean().notEmpty().not().isString(),
];

const occupantNotificationTokenValidation = () => [
  query('token', 'notification token  is missing').exists().notEmpty(),
];

const occupantsDashboardAttributesIdValidation = () => [
  oneOf( // <-- one of the following must exist
    [
      query('id', 'occupants dashboard attributes id is missing').exists().isUUID().notEmpty(),
      query('item_id', 'occupants dashboard attributes item_id is missing').exists().isUUID().notEmpty(),
    ],
  ),
];
const occupantsDashboardAttributesGetIdValidation = () => [
  oneOf( // <-- one of the following must exist
    [
      query('id', 'occupants dashboard attributes id is missing').exists().isUUID().notEmpty(),
      query('item_id', 'occupants dashboard attributes item_id is missing').exists().isUUID().notEmpty(),
    ],
  ),
];
const occupantsPermissionsIdValidation = () => [
  query('id', 'occupants permissions id is missing').exists().isUUID().notEmpty(),
  body('camera_device_id_list', 'camera_device_id_list missing').optional().isArray(),
  body('camera_device_id_list', 'Invalid camera_device_id_list').optional().isArray().isUUID(),
  header('x-access-token', 'x-access-token is missing').exists().not().isEmpty(),
];
const resendOccupantsPermissionsIdValidation = () => [
  body('id', 'occupants permissions id is missing').exists().isUUID().not()
    .isEmpty(),
];
const occupantsPermissionsGetIdValidation = () => [
  oneOf([query('gateway_id', 'occupants permissions gateway_id is missing').exists().isUUID().notEmpty(),
  query('gateway_code', 'occupants permissions gateway_code is missing').exists().notEmpty(),
  ])
];
const occupantNotificationTokenCreateRules = () => [
  body('dnd', 'dnd value is invalid').optional().isBoolean(),
  body('os', 'os value is missing').exists().isString().notEmpty(),
  body('token', 'token is missing').exists().isString().notEmpty(),
  body('is_enable', 'is_enable is missing').optional().notEmpty(),
  body('is_enable', 'is_enable value is invalid').optional().isBoolean(),
];
const occupantsDashboardAttributesCreateRules = () => [
  body('item_id', 'item_id value is missing or invalid').exists().notEmpty().isUUID().custom(value => {
    if (Array.isArray(value)) {
      throw new Error('item_id should not be an array');
    }
    return true;
  }),
  body('grid_order', 'grid_order value is missing').exists().notEmpty(),
  body('type', 'type is missing or invalid').exists().isString().notEmpty(),
];
const occupantsDashboardAttributesUpdateRules = () => [
  body('grid_order', 'grid_order value is missing').exists().notEmpty(),
  body('id', 'id value is missing').exists().isUUID().notEmpty(),
];
const occupantsPermissionsCreateRules = () => [
  body('gateway_id', 'gateway_id value is missing').exists().isUUID().notEmpty(),
  body('invitation_email', 'invitation_email value is missing').exists().isEmail().notEmpty(),
  body('start_time', 'start_time value is missing').optional(),
  body('end_time', 'end_time value is missing').optional(),
  body('is_temp_access', 'is_temp_access value is invalid').optional().isBoolean(),
  body('camera_device_id_list', 'camera_device_id_list missing').optional().isArray(),
  body('camera_device_id_list', 'Invalid camera_device_id_list').optional().isArray().isUUID(),
  body('access_level', 'access_level value is missing').exists().notEmpty(),
  body('access_level', 'access_level value must be in string').isString(),
  oneOf([
    body('access_level', 'invalid value for access_level').isIn(accessLevels),
  ]),
  header('x-access-token', 'x-access-token is missing').exists().not().isEmpty(),
];
const checkType = () => [
  oneOf([
    checkQuery('type', 'invalid value for type').isIn(Entities),
  ]),
];
const checkIdType = () => [
  oneOf([
    [query('id', 'id missing').exists(),
    query('id', 'invalid id').isUUID(),],
    [query('gateway_code', 'gateway_code missing').exists(),
    query('req_occupant_id', 'invalid req_occupant_id').exists(),
    query('req_occupant_id', 'invalid req_occupant_id').isUUID(),
    ]
  ]),
  query('type', 'type missing').exists(),
  query('type', 'invalid value for type').isIn(Entities),
];
const occupantSignUpRules = () => [
  body('email', 'invalid email value').exists().isString().not()
    .isEmpty()
    .isEmail(),
  body('password', 'Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character. ')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false,
      pointsPerUnique: 1,
      pointsPerRepeat: 0.5,
      pointsForContainingLower: 10,
      pointsForContainingUpper: 10,
      pointsForContainingNumber: 10,
      pointsForContainingSymbol: 10,
    }),
  body('first_name', 'first_name value is missing').exists().isString().not()
    .isEmpty(),
  body('phone_number', 'invalid phone_number value').exists().isMobilePhone().not()
    .isEmpty(),
  body('last_name', 'last_name value is missing').exists().isString().not()
    .isEmpty(),
  body('language', 'language value is missing').exists().isString().not()
    .isEmpty(),
  body('country', 'country value is missing').exists().isString().not()
    .isEmpty(),
  body('metadata', 'metadata value is missing').optional().not()
    .isEmpty(),
];
const occupantVerificationRules = () => [
  body('email', 'invalid email value').exists().isString().not()
    .isEmpty()
    .isEmail(),
  body('code', 'invalid code value').exists().isString().not()
    .isEmpty()
    .isLength(6)
    .isLength({ max: 6 }),
];
const occupantSignInRules = () => [
  body('email', 'invalid email value').exists().isString().not()
    .isEmpty()
    .isEmail(),
  body('password', 'Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character. ').exists().not()
    .isEmpty()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false,
      pointsPerUnique: 1,
      pointsPerRepeat: 0.5,
      pointsForContainingLower: 10,
      pointsForContainingUpper: 10,
      pointsForContainingNumber: 10,
      pointsForContainingSymbol: 10,
    }),
];

const occupantForgotPasswordRules = () => [
  body('email', 'invalid email value').exists().isString().not()
    .isEmpty()
    .isEmail(),
];

const addOccupantsPermissionsMetadataRules = () => [
  body('key', 'key is missing').exists().isString().notEmpty(),
  body('key', 'key has exceeded the max character length 255').exists().isString().notEmpty().isLength({ max: 255 }),
  body('value', 'value is missing').exists().isString().notEmpty(),
  body('value', 'value has exceeded the max character length 255').exists().isString().notEmpty().isLength({ max: 255 }),
  body('occupant_permission_id', 'occupant_permission_id is missing').exists().isUUID().notEmpty(),
];

const getOccupantsPermissionsMetadataRules = () => [
  query('occupant_permission_id', 'occupant_permission_id missing').exists().isUUID().notEmpty(),
];

const equipmentsDataCreateRules = () => [
  body('type', 'type value is missing or invalid').exists().isString().notEmpty(),
  body('item_id', 'item_id value is missing or invalid').exists().isUUID().notEmpty(),
  body('token', 'token is missing or invalid').exists().isString().notEmpty(),
  body('value', 'value is missing or invalid').exists().isObject().notEmpty(),
];

const equipmentsDataGetRules = () => [
  oneOf( // <-- one of the following must exist
    [
      query('id', 'id is missing or invalid').exists().isUUID().notEmpty(),
      query('token', 'tokeni s missing or invalid').exists().isString().notEmpty(),
    ],
  ),
];

const equipmentsDataDeleteRules = () => [
  query('id', 'id is missing or invalid').exists().isUUID().notEmpty(),
];

export {
  // eslint-disable-next-line import/prefer-default-export
  createInvitatioRules, occupantCheckInRules, occupantCheckOutRules, occupantCreateRules,
  editInvitatioRules, occupantDeleteValidation, occupantDeviceAlertRules,
  occupantNotificationTokenUpdateValidation, occupantNotificationTokenCreateRules,
  occupantsDashboardAttributesIdValidation, occupantsDashboardAttributesCreateRules,
  occupantsPermissionsIdValidation, occupantsPermissionsCreateRules,
  occupantsDashboardAttributesGetIdValidation, occupantsPermissionsGetIdValidation,
  resendOccupantsPermissionsIdValidation,
  occupantsDashboardAttributesUpdateRules, occupantNotificationTokenValidation, checkType,
  occupantSignUpRules, occupantVerificationRules, occupantSignInRules, checkIdType,
  occupantForgotPasswordRules, editOccupantRules, isEmptybody, validationForPhoneNumber,
  validationForCountry, getOccupantsPermissionsMetadataRules, addOccupantsPermissionsMetadataRules,
  equipmentsDataCreateRules, equipmentsDataGetRules, equipmentsDataDeleteRules,
};
