import express from 'express';
import AlertCommunicationConfigsController from '../controllers/AlertCommunicationConfigsController';
import {
  addAlertCommunicationConfigsRule, getAlertCommunicationConfigsRule,
  addMultipleAlertCommunicationConfigsRule,
} from '../middlewares/validations/AlertCommunicationConfigs';
import { validation } from '../middlewares/validations/Validator';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.post('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, addMultipleAlertCommunicationConfigsRule(), validation, getCompanyIdFromCode, asyncErrorHandler(AlertCommunicationConfigsController.addAlertCommunicationConfigs));
router.get('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getAlertCommunicationConfigsRule(), validation, getCompanyIdFromCode, asyncErrorHandler(AlertCommunicationConfigsController.getAlertCommunicationConfigs));

export default router;
