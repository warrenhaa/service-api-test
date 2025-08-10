import express from 'express';
import ModelsController from '../controllers/ModelsController';
import { modelCreateRule, modelEditRule, modelDeleteRule } from '../middlewares/validations/Models';
import { validation } from '../middlewares/validations/Validator';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.get('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(ModelsController.getModels));
router.post('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, modelCreateRule(), validation, asyncErrorHandler(ModelsController.createModel));
router.put('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, modelEditRule(), validation, asyncErrorHandler(ModelsController.updateModel));
router.delete('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, modelDeleteRule(), validation, asyncErrorHandler(ModelsController.deleteModel));

export default router;
