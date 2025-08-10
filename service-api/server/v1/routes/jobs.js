import express from 'express';
import JobsController from '../controllers/JobsController';
import { validation } from '../middlewares/validations/Validator';
import { getJobRule } from '../middlewares/validations/jobs';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.get('/', verifyCompanyCode, getCompanyIdFromCode, getJobRule(), validation, asyncErrorHandler(JobsController.getJob));

export default router;
