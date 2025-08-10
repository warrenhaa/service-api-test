import express from 'express';
import ErrorCodesController from '../controllers/ErrorCodesController';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.get('/', (ErrorCodesController.getErrorCodesList));

export default router;
