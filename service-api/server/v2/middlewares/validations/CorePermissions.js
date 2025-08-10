import { body } from 'express-validator';

const createCorePermissionRules = () => [
  body('user_id').isUUID().notEmpty(),
  body('permissions.core_permissions').notEmpty(),
  body('permissions.core_permission_mapping_id').isUUID().notEmpty(),
];

export default createCorePermissionRules;
