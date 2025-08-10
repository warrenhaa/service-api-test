import express from 'express';
import LocationTypesController from '../controllers/LocationTypesController';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import createLocationTypesRules from '../middlewares/validations/LocationsTypes';
import { validation } from '../middlewares/validations/Validator';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import uuidRules from '../middlewares/validations/UUIDValidation';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.get('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(LocationTypesController.getAllLocationTypes));
router.get('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(LocationTypesController.getALocationType));
router.post('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, createLocationTypesRules(), validation, asyncErrorHandler(LocationTypesController.createLocationType));
router.put('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(LocationTypesController.updateLocationType));
router.delete('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(LocationTypesController.deleteLocationType));

export default router;
