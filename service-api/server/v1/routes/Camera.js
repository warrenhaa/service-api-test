import express from 'express';
import CameraController from '../controllers/CameraController';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import { validation } from '../middlewares/validations/Validator';
import { deleteCamera, getConnectionHistory } from '../middlewares/validations/Camera';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';

const {
  authVerification, verifyCompanyCode,
  verifyUserOrOccupant,
} = require('../helpers/Authentication');

const router = express.Router();

router.delete('/delete_camera', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, deleteCamera(), validation, asyncErrorHandler(CameraController.deleteCameraAction));
router.get('/history', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getConnectionHistory(), validation, asyncErrorHandler(CameraController.getHistory));


export default router;