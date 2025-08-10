import express from 'express';
import AlertsController from '../controllers/AlertsController';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import { updateDeviceAlert } from '../middlewares/validations/DeviceAlerts';
import { validation } from '../middlewares/validations/Validator';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.get('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, asyncErrorHandler(AlertsController.getAllAlerts));

router.put('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, updateDeviceAlert(), validation, asyncErrorHandler(AlertsController.updateDeviceAlert));

export default router;
