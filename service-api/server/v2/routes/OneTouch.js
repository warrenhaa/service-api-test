import express from 'express';
import OneTouchController from '../controllers/OneTouchController';
import OneTouchCommunicationConfigController from '../controllers/OneTouchCommunicationConfigController';
import {
  addOneTouchRule, updateOneTouchRules, deleteOneTouchRule, deleteMultipleOneTouchRule, uniqueActionTriggerKey,
  getOneTouchRule, getOneTouchRules, getGatewayOneTouchRules, ruleGroupsRules, oneTouchPhoneNumberArrayRule,
} from '../middlewares/validations/OneTouch';
import {
  getOneTouchCommunicationConfig, addOneTouchCommunicationConfig,
  updateOneTouchCommunicationConfig, deleteOneTouchCommunicationConfig,
  phoneNumberArrayRule,
} from '../middlewares/validations/OneTouchCommunicationConfig';
import { validation } from '../middlewares/validations/Validator';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();
router.post('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, addOneTouchRule(), uniqueActionTriggerKey, oneTouchPhoneNumberArrayRule, validation, asyncErrorHandler(OneTouchController.addOneTouchRule));
router.put('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, updateOneTouchRules(), validation, asyncErrorHandler(OneTouchController.updateOneTouchRules));
router.delete('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, deleteOneTouchRule(), validation, asyncErrorHandler(OneTouchController.deleteOneTouchRule));
router.delete('/multiple', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, deleteMultipleOneTouchRule(), validation, asyncErrorHandler(OneTouchController.deleteMultipleOneTouchRule));
router.get('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getOneTouchRule(), validation, asyncErrorHandler(OneTouchController.getOneTouchRule));
router.get('/list', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getOneTouchRules(), validation, asyncErrorHandler(OneTouchController.getOneTouchRules));
router.get('/gateway_rules', getGatewayOneTouchRules(), validation, asyncErrorHandler(OneTouchController.getGatewayOneTouchRules));
router.get('/config', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getOneTouchCommunicationConfig(), validation, asyncErrorHandler(OneTouchCommunicationConfigController.getOneTouchCommunicationConfig));
router.post('/config', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, addOneTouchCommunicationConfig(), validation, asyncErrorHandler(OneTouchCommunicationConfigController.addOneTouchCommunicationConfig));
router.put('/config', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, updateOneTouchCommunicationConfig(), validation, asyncErrorHandler(OneTouchCommunicationConfigController.updateOneTouchCommunicationConfig));
router.put('/rule_groups', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, ruleGroupsRules(), validation, asyncErrorHandler(OneTouchController.updateRuleGroups));
router.delete('/config', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, deleteOneTouchCommunicationConfig(), validation, asyncErrorHandler(OneTouchCommunicationConfigController.deleteOneTouchCommunicationConfig));
export default router;
