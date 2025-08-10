import express from 'express';
import UserPreferencesController from '../controllers/UserPreferencesController';
import {
  userPreferenceRules,
} from '../middlewares/validations/UserPreferences';
import { validation } from '../middlewares/validations/Validator';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.post('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, userPreferenceRules(), validation, asyncErrorHandler(UserPreferencesController.createUserPreferences));
router.put('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(UserPreferencesController.updateUserPreferences));
router.get('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(UserPreferencesController.getUserPreferences));

export default router;
