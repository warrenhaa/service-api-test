import express from 'express';
import DevicesController from '../controllers/DevicesController';
import CategoryController from '../controllers/CategoryController';
import getCompanyIdFromCode from '../middlewares/CompaniesFromCode';
import {
  createDeviceRules, DeviceValidation, validateArrayUUID, createBulkDeviceRules,
  updateBulkDeviceRules, getConnectionHistory, deleteGatewayRules, deleteDeviceRules,
  checkGatewayExistRules, UploadFileCheck, SchedulesUploadFileCheck, gatewayCameraLink,
  gatewayCameraList, gatewayCameraPlanLink, categoryAddRules, localCloudSyncupRules,
  getUserAnalytics, getDeviceShadows,changeOwnerRules, getKibanaConnectionHistory,pincodeDetails,gatewaySettings
} from '../middlewares/validations/Devices';
import { validation } from '../middlewares/validations/Validator';
import asyncErrorHandler from '../middlewares/AsyncErrorHandler';
import uuidRules from '../middlewares/validations/UUIDValidation';
import upload from '../middlewares/UploadCsv';
import uploadImage from '../middlewares/UploadImage'
import uploadJsonFile from '../middlewares/UploadJsonFile';

const {
  authVerification, verifyCompanyCode, verifyOccupant,
  verifyUserOrOccupant, verifyUser, restrictDemoAccount
} = require('../helpers/Authentication');

const router = express.Router();

router.put('/linkGatewayLocation', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, validateArrayUUID, asyncErrorHandler(DevicesController.linkGatewayLocation));
router.put('/importGatewayLocation', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, upload.single('file'), asyncErrorHandler(DevicesController.CsvTolinkGatewayLocation));
router.put('/multiple', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, validateArrayUUID, asyncErrorHandler(DevicesController.updateMultipleDevice));
router.get('/location/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(DevicesController.getAllDevicesofALocation));
router.get('/history', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getConnectionHistory(), validation, asyncErrorHandler(DevicesController.getHistory));
router.get('/kibana_history', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getKibanaConnectionHistory(), validation, asyncErrorHandler(DevicesController.getKibanaHistory));
router.post('/device_shadows', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getDeviceShadows(), validation, asyncErrorHandler(DevicesController.getDeviceShadows));
router.get('/user_analytics', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, getUserAnalytics(), validation, asyncErrorHandler(DevicesController.getUserAnalytics));
router.get('/', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(DevicesController.getAllDevices));
router.get('/types', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, asyncErrorHandler(DevicesController.getAllDeviceTypes));
router.post('/bulk', authVerification,restrictDemoAccount, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, createBulkDeviceRules(), DeviceValidation, asyncErrorHandler(DevicesController.createBulkDevices));
router.post('/', authVerification,restrictDemoAccount, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, createDeviceRules, validation, asyncErrorHandler(DevicesController.createDevice));
router.post('/change_owner', authVerification,restrictDemoAccount, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode,changeOwnerRules(), validation,  asyncErrorHandler(DevicesController.changeOwner));
router.put('/bulk', authVerification,restrictDemoAccount, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, updateBulkDeviceRules(), DeviceValidation, asyncErrorHandler(DevicesController.updateBulkDevice));
router.delete('/gateway', authVerification,restrictDemoAccount, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, deleteGatewayRules(), validation, asyncErrorHandler(DevicesController.deleteGateway));
router.delete('/device', authVerification,restrictDemoAccount, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, deleteDeviceRules(), validation, asyncErrorHandler(DevicesController.deleteDevice));
router.get('/user_devices/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(DevicesController.getUserDevices));
router.put('/unlinkGatewayLocation/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(DevicesController.unlinkGatewayLocation));
router.put('/unlinkDeviceLocation/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(DevicesController.unlinkDeviceLocation));
router.get('/getParentLocationsDevices/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(DevicesController.getParentLocationsDevices));
router.get('/secondaryLocations/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(DevicesController.getSecondaryLocations));
router.post('/check_gateway_exist', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, checkGatewayExistRules(), validation, asyncErrorHandler(DevicesController.checkGatewayExist));
router.post('/gateway_camera_link', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, gatewayCameraLink(), validation, asyncErrorHandler(DevicesController.gatewayCameraLink));
router.post('/gateway_camera_plan_link', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, gatewayCameraPlanLink(), validation, asyncErrorHandler(DevicesController.gatewayCameraPlanLink));
router.post('/gateway_image', authVerification, verifyCompanyCode, getCompanyIdFromCode, uploadImage.single('file'), asyncErrorHandler(DevicesController.setGatewayImage));
router.post('/one_touch_rules', UploadFileCheck(), validation, uploadJsonFile.single('file'), asyncErrorHandler(DevicesController.uploadFileOneTouch));
router.post('/schedules', SchedulesUploadFileCheck(), validation, uploadJsonFile.single('file'), asyncErrorHandler(DevicesController.uploadFileSchedules));
router.post('/category', authVerification, verifyCompanyCode, verifyUser, categoryAddRules(), validation, asyncErrorHandler(CategoryController.addCategory));
router.get('/gateway_camera_list', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, gatewayCameraList(), validation, asyncErrorHandler(DevicesController.gatewayCameraList));
router.post('/local_cloud_syncup', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, localCloudSyncupRules(), validation, asyncErrorHandler(DevicesController.localCloudSyncup));
router.get('/pincode_details', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, pincodeDetails(), validation, asyncErrorHandler(DevicesController.getPinCodeDetails));
router.put('/gateway_settings', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, gatewaySettings(), validation, asyncErrorHandler(DevicesController.updateGatewaySettings));
router.get('/:id', authVerification, verifyCompanyCode, verifyUser, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(DevicesController.getADevice));
router.put('/:id', authVerification, verifyCompanyCode, verifyUserOrOccupant, getCompanyIdFromCode, uuidRules(), validation, asyncErrorHandler(DevicesController.updateDevice));

export default router;
