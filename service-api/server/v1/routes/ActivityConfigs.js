import express from 'express';
import ActivityConfigsController from '../controllers/ActivityConfigsController';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import {
  createActivityConfigRules,
} from '../middlewares/validations/ActivityLogs';
import {
  validation,
} from '../middlewares/validations/Validator';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.post('/', authVerification, verifyCompanyCode, verifyUser, createActivityConfigRules(), validation, getCompanyIdFromCode, asyncErrorHandler(ActivityConfigsController.createActivityConfigs));
router.get('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(ActivityConfigsController.getAllActivityConfigs));
router.delete('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(ActivityConfigsController.deleteActivityConfig));

export default router;
