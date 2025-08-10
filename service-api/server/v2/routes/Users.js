import express from 'express';
import UserController from '../controllers/UserController';
import { validation } from '../middlewares/validations/Validator';
import {
  userBodyRule, userCreateRule, userIdRule, userDeleteValidation, loginBodyRule,
} from '../middlewares/validations/Users';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.put('/admin_status/:id', authVerification, verifyCompanyCode, verifyUser, userIdRule(), validation, asyncErrorHandler(UserController.updateAdminStatus));
router.get('/user_companies', authVerification, verifyCompanyCode, verifyUser, userBodyRule(), validation, UserController.getAllCompaniesOfAUserFromCognitoId);
router.put('/user_attributes', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(UserController.updateUserAttributes));
router.get('/location_users', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(UserController.getUsersOfLocation));
router.get('/location_non_users', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(UserController.getNonUsersOfLocation));
router.get('/users_location', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(UserController.getUsersLocation));
router.get('/company', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, UserController.getAllUsersOfACompany);
router.get('/user_cognito', authVerification, verifyCompanyCode, verifyUserOrOccupant, userBodyRule(), validation, getCompanyIdFromCode, asyncErrorHandler(UserController.getUserFromCognitoId));
router.post('/create_user', authVerification, verifyCompanyCode, userCreateRule(), validation, asyncErrorHandler(UserController.createUser));
router.post('/login', verifyCompanyCode, loginBodyRule(), validation, getCompanyIdFromCode, asyncErrorHandler(UserController.login));
router.delete('/:id', authVerification, verifyCompanyCode, verifyUser, userDeleteValidation(), validation, getCompanyIdFromCode, asyncErrorHandler(UserController.deleteUser));
router.get('/dt_preference/:id', authVerification, verifyCompanyCode, verifyUser, userIdRule(), validation, asyncErrorHandler(UserController.getDataTablePreferences));
router.post('/dt_preference/:id', authVerification, verifyCompanyCode, verifyUser, userIdRule(), validation, asyncErrorHandler(UserController.createDataTablePreferences));
router.delete('/dt_preference/:id', authVerification, verifyCompanyCode, verifyUser, userIdRule(), validation, asyncErrorHandler(UserController.deleteDataTablePreferences));

export default router;
