import express from 'express';
import LocationsController from '../controllers/LocationsController';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import { validation } from '../middlewares/validations/Validator';
import createLocationsRules from '../middlewares/validations/Locations';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import uuidRules from '../middlewares/validations/UUIDValidation';
import upload from '../middlewares/UploadCsv';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.post('/importLocations', upload.single('file'), authVerification, verifyCompanyCode, verifyUser, asyncErrorHandler(LocationsController.importCsvForLocation));
router.get('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(LocationsController.getAllLocations));
router.get('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(LocationsController.getALocation));
router.get('/:id/:userId', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(LocationsController.getRoleByLocationId));
router.post('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, createLocationsRules(), validation, asyncErrorHandler(LocationsController.createLocation));
router.put('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(LocationsController.updateLocation));
router.delete('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(LocationsController.deleteLocation));

export default router;
