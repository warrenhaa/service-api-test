import express from 'express';
import TestAuthContoller from '../controllers/TestAuthContoller';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.get('/token', TestAuthContoller.getToken);
export default router;
