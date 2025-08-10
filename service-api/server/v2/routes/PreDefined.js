import express from 'express';
import PreDefinedController from '../controllers/PreDefinedController';
import {
  addPreDefinedRule, deletePreDefinedRule,
} from '../middlewares/validations/PreDefined';
import { validation } from '../middlewares/validations/Validator';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.post('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, addPreDefinedRule(), validation, asyncErrorHandler(PreDefinedController.addPreDefinedRule));
router.delete('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, deletePreDefinedRule(), validation, asyncErrorHandler(PreDefinedController.deletePreDefinedRule));

export default router;
