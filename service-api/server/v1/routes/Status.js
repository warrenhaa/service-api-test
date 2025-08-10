import express from 'express';
import StatusController from '../controllers/StatusController';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.get('/', asyncErrorHandler(StatusController.getStatus));

export default router;
