import express from 'express';
import ActivityLogController from '../controllers/ActivityLogController';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.get('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, ActivityLogController.getAllActivityLog);
router.post('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, ActivityLogController.createActivityLog);

export default router;
