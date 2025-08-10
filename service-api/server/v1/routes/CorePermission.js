import express from 'express';
import CorePermissionController from '../controllers/CorePermissionController';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import createCorePermissionRules from '../middlewares/validations/CorePermissions';
import { validation } from '../middlewares/validations/Validator';
import uuidRules from '../middlewares/validations/UUIDValidation';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.get('/user_permissions', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(CorePermissionController.getCorePermissionsOfUser));
router.post('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, createCorePermissionRules(), validation, asyncErrorHandler(CorePermissionController.createCorePermission));
router.get('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(CorePermissionController.getAllCorePermissions));
router.get('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(CorePermissionController.getACorePermission));
router.delete('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(CorePermissionController.deleteACorePermission));

export default router;
