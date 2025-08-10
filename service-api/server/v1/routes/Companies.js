import express from 'express';
import CompaniesController from '../controllers/CompaniesController';
import { createCompanyRules, companyUUIDRule } from '../middlewares/validations/Companies';
import { validation } from '../middlewares/validations/Validator';
import upload from '../middlewares/Upload';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.post('/upload', upload.single('file'), verifyCompanyCode, asyncErrorHandler(CompaniesController.bulkUploadCompanies));
router.get('/', authVerification, verifyCompanyCode, verifyUser, asyncErrorHandler(CompaniesController.getAllCompanies));
router.get('/:id', authVerification, verifyCompanyCode, verifyUser, companyUUIDRule(), validation, asyncErrorHandler(CompaniesController.getCompany));
router.post('/', authVerification, verifyCompanyCode, createCompanyRules(), validation, asyncErrorHandler(CompaniesController.createCompanies));
router.put('/:id', authVerification, verifyCompanyCode, verifyUser, companyUUIDRule(), validation, asyncErrorHandler(CompaniesController.updateCompanies));
router.delete('/:id', authVerification, verifyCompanyCode, verifyUser, companyUUIDRule(), validation, asyncErrorHandler(CompaniesController.deleteCompanies));

export default router;
