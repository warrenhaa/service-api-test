import { body, param } from 'express-validator';

const createCompanyRules = () => [
  body('name').isString().notEmpty(),
  body('code').isString().notEmpty(),
  body('aws_cognito_id').isString().notEmpty(),
  body('aws_cognito_identity_pool').isString().notEmpty(),
  body('aws_cognito_region').isString().notEmpty(),
  body('aws_cognito_user_pool').isString().notEmpty(),
  body('aws_cognito_userpool_web_client_id').isString().notEmpty(),
  body('aws_iam_access_key').isString().notEmpty(),
  body('aws_iam_access_secret').isString().notEmpty(),
  body('aws_iot_end_point').isString().notEmpty(),
  body('aws_region').isString().notEmpty(),
  body('aws_s3_bucket_name').isString().notEmpty(),
  body('aws_topics_to_subscribe').isString().notEmpty(),
  body('device_to_user_list').isString().notEmpty(),
  body('es_endpoint').isString().notEmpty(),
  body('es_password').isString().notEmpty(),
  body('es_username').isString().notEmpty(),
  body('index_name').isString().notEmpty(),
  body('user_to_device_list').isString().notEmpty(),
  body('address_id', 'address_id must not be empty').isUUID().optional().notEmpty(),
  body('contact_details.contact_url', 'contact_url is missing').exists().isString().notEmpty(),
  body('contact_details.website_url', 'website_url is missing').exists().isString().notEmpty(),
  body('app_urls.android').isString().optional(),
  body('app_urls.ios').isString().optional(),
  body('app_urls.web_app').isString().optional(),
  body('app_urls.admin_site').isString().optional(),
  body('activities_configs.activity_email_enabled', 'activity_email boolean value is missing').exists().isBoolean().notEmpty(),
  body('activities_configs.activity_sms_enabled', 'activity_sms boolean value is missing').exists().isBoolean().notEmpty(),
  body('activities_configs.activity_notification_enabled', 'activity_notification boolean value is missing').exists().isBoolean().notEmpty(),
  body('alert_configs.alert_email_enabled', 'alert_email boolean value is missing').exists().isBoolean().notEmpty(),
  body('alert_configs.alert_sms_enabled', 'alert_sms boolean value is missing').exists().isBoolean().notEmpty(),
  body('alert_configs.alert_notification_enabled', 'alert_notification boolean value is missing').exists().isBoolean().notEmpty(),
  body('templates.email_template', 'email_template is missing').isString().optional().notEmpty(),
  body('templates.sms_template', 'sms_template is missing').isString().optional().notEmpty(),
  body('templates.notification_template', 'notification_template is missing').isString().optional().notEmpty(),
];

const companyUUIDRule = () => [
  param('id').isUUID(),
];

export { createCompanyRules, companyUUIDRule };
