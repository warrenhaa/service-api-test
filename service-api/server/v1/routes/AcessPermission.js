import express from 'express';
import AccessPermissionController from '../controllers/AccessPermissionController';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import {
  createPermissionFromInviteRules,
  createPermissionRules,
  locationPermissionDeletionRules,
} from '../middlewares/validations/AccessPermission';
import {
  validation,
  accessPermissionParamIdRules,
  accessPermissionUpdateRules,
} from '../middlewares/validations/Validator';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.get('/user_locations', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(AccessPermissionController.getAllLocationsOfUser));
router.post('/permissions_invite', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, createPermissionFromInviteRules(), validation, asyncErrorHandler(AccessPermissionController.createAccessPermissionFromInvite));
router.post('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, createPermissionRules(), validation, asyncErrorHandler(AccessPermissionController.createAccessPermission));
router.get('/get/:id', verifyCompanyCode, getCompanyIdFromCode, accessPermissionParamIdRules(), validation, asyncErrorHandler(AccessPermissionController.getAccessPermissions));
router.get('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, accessPermissionParamIdRules(), validation, asyncErrorHandler(AccessPermissionController.getAccessPermissions));
router.put('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, accessPermissionUpdateRules(), validation, asyncErrorHandler(AccessPermissionController.updateUserPermissions));
router.delete('/location_permissions', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, locationPermissionDeletionRules(), validation, asyncErrorHandler(AccessPermissionController.deleteLocationPermissions));

export default router;
