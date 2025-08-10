import express from 'express';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import { validation } from '../middlewares/validations/Validator';
import RuleGroupsController from '../controllers/RuleGroupsController';
import {
  getRuleGroups, getAllRuleGroups,
  addRuleGroups, updateRuleGroups, deleteRuleGroups,
} from '../middlewares/validations/RuleGroups';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.get('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getRuleGroups(), validation, asyncErrorHandler(RuleGroupsController.getRuleGroups));
router.get('/list', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getAllRuleGroups(), validation, asyncErrorHandler(RuleGroupsController.getAllRuleGroups));
router.post('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, addRuleGroups(), validation, asyncErrorHandler(RuleGroupsController.addRuleGroups));
router.put('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, updateRuleGroups(), validation, asyncErrorHandler(RuleGroupsController.updateRuleGroups));
router.delete('/', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, deleteRuleGroups(), validation, asyncErrorHandler(RuleGroupsController.deleteRuleGroups));

export default router;
