import express from 'express';
import OccupantsController from '../controllers/OccupantsController';
import OccupantsNotificationTokensController from '../controllers/OccupantsNotificationTokensController';
import OccupantsDashboardAttributesController from '../controllers/OccupantsDashboardAttributesController';
import OccupantsPermissionsController from '../controllers/OccupantsPermissionsController';
import OccupantsGroupsController from '../controllers/OccupantsGroupsController';
import OccupantsEquipmentsDataController from '../controllers/OccupantsEquipmentsDataController';
import {
  createInvitatioRules, occupantCheckInRules, occupantCheckOutRules, occupantCreateRules,
  editInvitatioRules, occupantDeleteValidation, occupantDeviceAlertRules,
  occupantNotificationTokenUpdateValidation, occupantNotificationTokenCreateRules,
  occupantsDashboardAttributesCreateRules, occupantsDashboardAttributesIdValidation,
  occupantsDashboardAttributesUpdateRules,
  occupantsDashboardAttributesGetIdValidation, occupantsPermissionsIdValidation, resendOccupantsPermissionsIdValidation,
  occupantsPermissionsCreateRules, occupantsPermissionsGetIdValidation, occupantNotificationTokenValidation, checkType,
  occupantSignUpRules, occupantVerificationRules, occupantSignInRules, checkIdType, occupantForgotPasswordRules,
  editOccupantRules, isEmptybody, validationForCountry, validationForPhoneNumber,
  getOccupantsPermissionsMetadataRules, addOccupantsPermissionsMetadataRules,
  equipmentsDataCreateRules, equipmentsDataGetRules, equipmentsDataDeleteRules,
} from '../middlewares/validations/Occupants';
import {
  addOccupantsGroupsRule, OccupantsGroupsRule, putOccupantsGroupsRule, addOccupantsGroupDevicesRule, deleteOccupantsGroupDevicesRule, validateArrayUUID
} from '../middlewares/validations/OccupantsGroups';
import { validation } from '../middlewares/validations/Validator';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import uuidRules from '../middlewares/validations/UUIDValidation';

var {
  authVerification, authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');
var {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,restrictDemoAccount
} = require('../helpers/Authentication');

const router = express.Router();
router.post('/create_invitation', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, createInvitatioRules(), validation, asyncErrorHandler(OccupantsController.addOccupantInvitation));
router.post('/occupant_check_in', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, occupantCheckInRules(), validation, asyncErrorHandler(OccupantsController.occupantCheckIn));
router.put('/occupant_check_out', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, occupantCheckOutRules(), validation, asyncErrorHandler(OccupantsController.occupantCheckOut));
router.post('/create_occupant', authVerification, verifyCompanyCode, getCompanyIdFromCode, occupantCreateRules(), validation, asyncErrorHandler(OccupantsController.addOccupants));
router.get('/slider_list', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, asyncErrorHandler(OccupantsController.getOccupantSliderList));
router.get('/slider_details', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, checkIdType(), validation, asyncErrorHandler(OccupantsController.getOccupantSliderDetails));
router.get('/ungrouped_devices', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, checkIdType(), validation, asyncErrorHandler(OccupantsController.getOccupantUnGroupedList));
router.get('/categories', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, checkIdType(), validation, asyncErrorHandler(OccupantsController.getOccupantCategoryList));
router.get('/profile', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, asyncErrorHandler(OccupantsController.getOccupantProfile));
router.get('/delete_confirmation', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(OccupantsController.deleteConfirmation));
router.put('/expire_invitations', verifyCompanyCode, getCompanyIdFromCode, asyncErrorHandler(OccupantsController.expireInvitation));
router.put('/resend_invitation/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(OccupantsController.resendOccupantInvitation));
router.put('/edit_invite_location/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, editInvitatioRules(), uuidRules(), validation, asyncErrorHandler(OccupantsController.editInviteLocation));
router.put('/edit_occupant', authVerification,restrictDemoAccount, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, isEmptybody, validationForCountry, validationForPhoneNumber, editOccupantRules(), validation, asyncErrorHandler(OccupantsController.editOccupants));
router.get('/alerts', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, occupantDeviceAlertRules(), validation, asyncErrorHandler(OccupantsController.getOccupantAlerts));
router.get('/device_alerts_count', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, occupantDeviceAlertRules(), validation, asyncErrorHandler(OccupantsController.getOccupantDeviceAlertsCount));
router.delete('/delete_occupant', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, occupantDeleteValidation(), validation, asyncErrorHandler(OccupantsController.deleteOccupant));
router.get('/notification_tokens', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, validation, asyncErrorHandler(OccupantsNotificationTokensController.getOccupantsNotificationTokens));
router.post('/notification_tokens', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, occupantNotificationTokenCreateRules(), validation, asyncErrorHandler(OccupantsNotificationTokensController.addOccupantsNotificationTokens));
router.put('/notification_tokens', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, occupantNotificationTokenUpdateValidation(), validation, asyncErrorHandler(OccupantsNotificationTokensController.putOccupantsNotificationTokens));
router.delete('/notification_tokens', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, occupantNotificationTokenValidation(), validation, asyncErrorHandler(OccupantsNotificationTokensController.deleteOccupantsNotificationTokens));
router.get('/dashboard_attributes', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, occupantsDashboardAttributesGetIdValidation(), validation, asyncErrorHandler(OccupantsDashboardAttributesController.getOccupantsDashboardAttributes));
router.post('/dashboard_attributes', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, occupantsDashboardAttributesCreateRules(), validation, asyncErrorHandler(OccupantsDashboardAttributesController.addOccupantsDashboardAttributes));
router.put('/dashboard_attributes', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, occupantsDashboardAttributesUpdateRules(), validation, asyncErrorHandler(OccupantsDashboardAttributesController.putOccupantsDashboardAttributes));
router.delete('/dashboard_attributes', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, occupantsDashboardAttributesIdValidation(), validation, asyncErrorHandler(OccupantsDashboardAttributesController.deleteOccupantsDashboardAttributes));
router.get('/permissions', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, occupantsPermissionsGetIdValidation(), validation, asyncErrorHandler(OccupantsPermissionsController.getOccupantsPermissions));
router.post('/permissions', authVerification,restrictDemoAccount, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, occupantsPermissionsCreateRules(), validation, asyncErrorHandler(OccupantsPermissionsController.addOccupantsPermissions));
router.put('/permissions/resend', authVerification, restrictDemoAccount,verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, resendOccupantsPermissionsIdValidation(), validation, asyncErrorHandler(OccupantsPermissionsController.resendOccupantsPermissions));
router.put('/permissions', authVerification,restrictDemoAccount, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, occupantsPermissionsIdValidation(), validation, asyncErrorHandler(OccupantsPermissionsController.putOccupantsPermissions));
router.delete('/permissions', authVerification,restrictDemoAccount, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, occupantsPermissionsIdValidation(), validation, asyncErrorHandler(OccupantsPermissionsController.deleteOccupantsPermissions));
router.get('/groups', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, checkIdType(), validation, asyncErrorHandler(OccupantsGroupsController.getOccupantGroups));
router.get('/group', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, OccupantsGroupsRule(), validation, asyncErrorHandler(OccupantsGroupsController.getOccupantGroup));
router.post('/group', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, addOccupantsGroupsRule(), validation, validateArrayUUID, asyncErrorHandler(OccupantsGroupsController.addOccupantGroup));
router.put('/group', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, putOccupantsGroupsRule(), validation, validateArrayUUID, asyncErrorHandler(OccupantsGroupsController.putOccupantGroup));
router.delete('/group', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, OccupantsGroupsRule(), validation, asyncErrorHandler(OccupantsGroupsController.deleteOccupantGroup));
router.get('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(OccupantsController.getAllOccupants));
router.delete('/delete_invitation/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(OccupantsController.deleteOccupantInvite));
router.post('/register', verifyCompanyCode, getCompanyIdFromCode, occupantSignUpRules(), validation, asyncErrorHandler(OccupantsController.signUp));
router.post('/permissions/metadata', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, addOccupantsPermissionsMetadataRules(), validation, asyncErrorHandler(OccupantsPermissionsController.addOccupantsPermissionsMetadata));
router.get('/permissions/metadata', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, getOccupantsPermissionsMetadataRules(), validation, asyncErrorHandler(OccupantsPermissionsController.getOccupantsPermissionsMetadata));
router.get('/equipments_data/list', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, equipmentsDataGetRules(), validation, asyncErrorHandler(OccupantsEquipmentsDataController.getOccupantsEquipmentsDataList));
router.get('/equipments_data', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, equipmentsDataGetRules(), validation, asyncErrorHandler(OccupantsEquipmentsDataController.getOccupantsEquipmentsData));
router.post('/equipments_data', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, equipmentsDataCreateRules(), validation, asyncErrorHandler(OccupantsEquipmentsDataController.addOccupantsEquipmentsData));
router.delete('/equipments_data', authVerification, verifyCompanyCode, verifyOccupant, getCompanyIdFromCode, equipmentsDataDeleteRules(), validation, asyncErrorHandler(OccupantsEquipmentsDataController.deleteOccupantsEquipmentsData));
router.post('/verify', verifyCompanyCode, getCompanyIdFromCode, occupantVerificationRules(), validation, asyncErrorHandler(OccupantsController.verify));
router.post('/login', verifyCompanyCode, getCompanyIdFromCode, occupantSignInRules(), validation, asyncErrorHandler(OccupantsController.signIn));
router.post('/forgot_password', verifyCompanyCode, getCompanyIdFromCode, occupantForgotPasswordRules(), validation, asyncErrorHandler(OccupantsController.passwordReset));
router.post('/notify_change_password',authVerification, verifyCompanyCode,verifyOccupant, getCompanyIdFromCode, asyncErrorHandler(OccupantsController.passwordChanged));
export default router;
