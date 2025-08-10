import express from 'express';
import CorePermissionMappingsController from '../controllers/CorePermissionMappingsController';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import { validation } from '../middlewares/validations/Validator';
import uuidRules from '../middlewares/validations/UUIDValidation';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.post('/', authVerification, verifyCompanyCode, verifyUser, authVerification, verifyCompanyCode, getCompanyIdFromCode, asyncErrorHandler(CorePermissionMappingsController.createCorePermissionMappings));
router.get('/', authVerification, verifyCompanyCode, verifyUser, authVerification, verifyCompanyCode, getCompanyIdFromCode, asyncErrorHandler(CorePermissionMappingsController.getAllCorePermissionMappings));
router.delete('/:id', authVerification, verifyCompanyCode, verifyUser, authVerification, verifyCompanyCode, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(CorePermissionMappingsController.deleteCorePermissionMappings));
router.put('/:id', authVerification, verifyCompanyCode, verifyUser, authVerification, verifyCompanyCode, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(CorePermissionMappingsController.updateCorePermissionMappings));
export default router;
