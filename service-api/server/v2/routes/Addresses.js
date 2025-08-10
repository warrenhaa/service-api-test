import express from 'express';
import AddressesController from '../controllers/AddressesController';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import addressRules from '../middlewares/validations/Adresses';
import { validation } from '../middlewares/validations/Validator';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import uuidRules from '../middlewares/validations/UUIDValidation';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.get('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(AddressesController.getAllAddresses));
router.get('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(AddressesController.getAddress));
router.post('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(AddressesController.createAddress));
router.put('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, addressRules(), validation, asyncErrorHandler(AddressesController.updateAddress));
router.delete('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(AddressesController.deleteAddress));

export default router;
