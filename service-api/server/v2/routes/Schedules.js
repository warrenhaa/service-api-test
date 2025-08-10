import express from 'express';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import { validation } from '../middlewares/validations/Validator';
import SchedulesController from '../controllers/SchedulesController';
import {
  getSchedules, getAllSchedules, getDeviceSchedules, addSchedules,
  updateDuplicateSchedules, updateSchedules, deleteSchedules, deleteAllSchedules,
  enableDeviceSchedules,
} from '../middlewares/validations/Schedules';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser,
} = require('../helpers/Authentication');

const router = express.Router();

router.get('/device_schedules', getDeviceSchedules(), validation, asyncErrorHandler(SchedulesController.getDeviceSchedules));
router.get('/schedule_list', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getAllSchedules(), validation, asyncErrorHandler(SchedulesController.getAllSchedules));
router.get('/:id', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getSchedules(), validation, asyncErrorHandler(SchedulesController.getSchedules));
router.post('/multiple', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, addSchedules(), validation, asyncErrorHandler(SchedulesController.addSchedules));
router.put('/enable', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, enableDeviceSchedules(), validation, asyncErrorHandler(SchedulesController.enableDeviceSchedules));
router.put('/duplicate', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, updateDuplicateSchedules(), validation, asyncErrorHandler(SchedulesController.updateDuplicateSchedules));
router.put('/multiple', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, updateSchedules(), validation, asyncErrorHandler(SchedulesController.updateSchedules));
router.delete('/multiple', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, deleteAllSchedules(), validation, asyncErrorHandler(SchedulesController.deleteAllSchedules));
router.delete('/:id', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, deleteSchedules(), validation, asyncErrorHandler(SchedulesController.deleteSchedules));
export default router;
