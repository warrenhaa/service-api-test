import express from 'express';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import FixExistingUserController from '../controllers/FixExistingUserDP';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.get('/listSuperAdmins', verifyCompanyCode, getCompanyIdFromCode, asyncErrorHandler(FixExistingUserController.getSuperAdmins));
router.get('/listLocationManagers', verifyCompanyCode, getCompanyIdFromCode, asyncErrorHandler(FixExistingUserController.getLocationManagers));
router.put('/updateControlAccess', verifyCompanyCode, getCompanyIdFromCode, asyncErrorHandler(FixExistingUserController.updateDeviceControlPermission));
router.put('/shareDevice', verifyCompanyCode, getCompanyIdFromCode, asyncErrorHandler(FixExistingUserController.shareDeviceExistingLocationManager));

export default router;
