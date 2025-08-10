import express from 'express';
import CompanyVerificationStatusController from '../controllers/CompanyVerificationStatusController';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.get('/:id', verifyCompanyCode, CompanyVerificationStatusController.getCompanyVerificationStatus);
router.get('/', verifyCompanyCode, CompanyVerificationStatusController.getAllCompanyVerificationStatus);

export default router;
