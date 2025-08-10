import express from 'express';
import InvitationController from '../controllers/InvitationController';
import { validation } from '../middlewares/validations/Validator';
import {
  sendInviteValidationRules, editInvitationPermission, editInvitationValidation, validateParamEmail,
} from '../middlewares/validations/Invitations';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import uuidRules from '../middlewares/validations/UUIDValidation';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.get('/getInviteId', verifyCompanyCode, getCompanyIdFromCode, validateParamEmail(), validation, asyncErrorHandler(InvitationController.getInviteDetailsByEmail));
router.get('/get/status/:id', verifyCompanyCode, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(InvitationController.getInvitationStatus));
router.get('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(InvitationController.getAllInvitations));
router.post('/send', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, sendInviteValidationRules(), validation, asyncErrorHandler(InvitationController.createInvitation));
router.put('/expire_invitations', verifyCompanyCode, getCompanyIdFromCode, asyncErrorHandler(InvitationController.expireInvitations));
router.put('/edit_permissions/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, editInvitationPermission(), editInvitationValidation, asyncErrorHandler(InvitationController.editInvitationPermission));
router.put('/expire/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(InvitationController.expireInvitation));
router.put('/accept/:id', verifyCompanyCode, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(InvitationController.acceptInvitation));
router.put('/resend/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(InvitationController.resendInvitation));
router.delete('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(InvitationController.deleteInvitation));

export default router;
