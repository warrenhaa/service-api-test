import express from 'express';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import { validation } from '../middlewares/validations/Validator';
import SingleControlsController from '../controllers/SingleControlsController';
import {
  addSingleControl, updateSingleControl, getSingleControl,
  getGatewaySingleControls, deleteSingleControl,
} from '../middlewares/validations/SingleControls';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.get('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getSingleControl(), validation, asyncErrorHandler(SingleControlsController.getSingleControl));
router.get('/list', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getGatewaySingleControls(), validation, asyncErrorHandler(SingleControlsController.getGatewaySingleControl));
router.post('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, addSingleControl(), validation, asyncErrorHandler(SingleControlsController.addSingleControl));
router.put('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, updateSingleControl(), validation, asyncErrorHandler(SingleControlsController.updateSingleControl));
router.delete('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, deleteSingleControl(), validation, asyncErrorHandler(SingleControlsController.deleteSingleControl));

export default router;
