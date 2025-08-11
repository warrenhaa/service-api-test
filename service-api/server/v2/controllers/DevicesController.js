import lodash from 'lodash';
import DevicesService from '../services/DevicesService';
import ModelsService from '../services/ModelsService';
import AccessPermissionService from '../services/AccessPermissionService';
import CorePermissionsMappingService from '../services/CorePermissionsMappingService';
import Util from '../../utils/Utils';
import { deleteFromCache } from '../../cache/Cache';
import CacheKeys from '../../cache/Constants';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';
import database from '../../models';
import jobsService from '../services/JobsService';
import Entities from '../../utils/constants/Entities';
import { getCompany } from '../../cache/Companies';

const path = require('path');

const CSVFileValidator = require('csv-validator');

const fs = require('fs');

const util = new Util();

class DevicesController {
  static async createDevice(req, res) {
    const devices = await DevicesService.createDevice(
      req,
    ).catch((error) => {
      throw new ApplicationError(error);
    });
    if (!req.occupant_id) {
      const request = { body: {} };
      request.body.name = devices.model;
      request.body.company_id = devices.company_id;
      const model = await ModelsService.getModel(request)
        .then((result) => result);
      if (model) {
        devices.description = model.dataValues.description;
      } else {
        devices.description = null;
      }
    }
    util.setSuccess(200, devices);
    return util.send(req, res);
  }

  static async changeOwner(req, res) {
    const permission = await DevicesService.changeOwner(
      req,
    ).catch((error) => {
      throw new ApplicationError(error);
    });
    util.setSuccess(200, permission);
    return util.send(req, res);
  }
  static async createBulkDevices(req, res) {
    if (!req.headers['x-access-token']) {
      const err = ErrorCodes['900009'];
      throw new ApplicationError(err);
    }
    const results = await DevicesService.createBulkDevices(
      req,
    ).catch((error) => {
      throw (error);
    });
    util.setSuccess(200, results);
    return util.send(req, res);
  }

  static async getAllDevicesofALocation(req, res) {
    let devices = await DevicesService.getAllDevicesOfLocation(
      req,
    );
    if (devices && devices.length > 0) {
      const sortKeys = req.query.sortKeys ? req.query.sortKeys.split(',') : null;
      const sortOrder = req.query.sortOrder ? req.query.sortOrder.split(',') : null;
      if (sortKeys && sortOrder) {
        devices = lodash
          .orderBy(devices, sortKeys, sortOrder); // Use Lodash to sort array by 'name'
      } else {
        devices = lodash.orderBy(devices, ['name'], ['desc']); // Use Lodash to sort array by 'name'
      }
      const models = await ModelsService.getModels(req)
        .then((result) => result);
      const devicesWithDescription = [];
      devices.forEach((device) => {
        const obj = { ...device };
        if (models.length > 0) {
          for (let i = 0; i < models.length; i += 1) {
            if (models[i].name === obj.model) {
              obj.description = models[i].description;
              break;
            } else {
              obj.description = null;
            }
          }
        } else {
          obj.description = null;
        }
        devicesWithDescription.push(obj);
      });
      util.setSuccess(200, devicesWithDescription);
    } else {
      const err = ErrorCodes['800001'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getUserDevices(req, res) {
    const { id } = req.params;
    const companyId = req.body.company_id;
    let devices = null;
    let locations = null;
    if (req.query.location_id) {
      locations = req.query.location_id;
    } else {
      const userLocations = await database.locations_permissions.findAll({
        where: {
          user_id: id,
          company_id: companyId,
        },
        attributes: ['location_id'],
        raw: true,
      });
      locations = lodash.map(userLocations, 'location_id');
    }
    devices = await DevicesService.getUserDevices(
      req, locations,
    );
    if (devices && devices.length > 0) {
      const sortKeys = req.query.sortKeys ? req.query.sortKeys.split(',') : null;
      const sortOrder = req.query.sortOrder ? req.query.sortOrder.split(',') : null;
      if (sortKeys && sortOrder) {
        devices = lodash
          .orderBy(devices, sortKeys, sortOrder); // Use Lodash to sort array by 'name'
      } else {
        devices = lodash.orderBy(devices, ({ name }) => name || '', ['desc']);
      }
      const models = await ModelsService.getModels(req)
        .then((result) => result);
      const devicesWithDescription = [];
      devices.forEach((device) => {
        const obj = { ...device };
        if (models.length > 0) {
          for (let i = 0; i < models.length; i += 1) {
            if (models[i].name === obj.model) {
              obj.description = models[i].description;
              break;
            } else {
              obj.description = null;
            }
          }
        } else {
          obj.description = null;
        }
        devicesWithDescription.push(obj);
      });
      util.setSuccess(200, devicesWithDescription);
    } else {
      const err = ErrorCodes['800002'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getAllDevices(req, res) {
    let devices = null;
    const id = req.body.company_id;
    const query = { ...req.query };
    query.company_id = id;
    const corePerm = await CorePermissionsMappingService.getCorePermissionMappings({ name: 'device_visibility', company_id: id });
    const permission = await AccessPermissionService.getAccessCorePermissions({ core_permission_mapping_id: corePerm.id, user_id: req.user_id, company_id: id });
    if (permission === null
      || permission === 'null'
      || typeof permission.device_visibility === undefined
      || permission.device_visibility.indexOf(corePerm.access_levels[1]) <= -1) { // assuming 1th element is for all device permission
      const err = ErrorCodes['140000'];
      throw new ApplicationError(err);
    }
    // const allDevices = await getAllFromCache(CacheKeys.DEVICES);
    // devices = lodash.filter(allDevices, query);
    // if (!devices || devices.length <= 0) {
    devices = await DevicesService.getAllDevices(
      req,
    );
    // }
    if (devices && devices.length > 0) {
      const sortKeys = req.query.sortKeys ? req.query.sortKeys.split(',') : null;
      const sortOrder = req.query.sortOrder ? req.query.sortOrder.split(',') : null;
      if (sortKeys && sortOrder) {
        devices = lodash
          .orderBy(devices, sortKeys, sortOrder); // Use Lodash to sort array by 'name'
      } else {
        devices = lodash.orderBy(devices, ({ name }) => name || '', ['desc']);
      }
      const models = await ModelsService.getModels(req)
        .then((result) => result);
      const devicesWithDescription = [];
      devices.forEach((device) => {
        let obj = { ...device };
        if (device.dataValues) {
          obj = { ...device.dataValues };
        }
        if (models.length > 0) {
          for (let i = 0; i < models.length; i += 1) {
            if (models[i].name === obj.model) {
              obj.description = models[i].description;
              break;
            } else {
              obj.description = null;
            }
          }
        } else {
          obj.description = null;
        }
        devicesWithDescription.push(obj);
      });
      util.setSuccess(200, devicesWithDescription);
    } else {
      const err = ErrorCodes['800002'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getAllDeviceTypes(req, res) {
    let devices = await DevicesService.getAllDeviceTypes(
      req,
    );
    if (devices && devices.length > 0) {
      const sortKeys = req.query.sortKeys ? req.query.sortKeys.split(',') : null;
      const sortOrder = req.query.sortOrder ? req.query.sortOrder.split(',') : null;
      if (sortKeys && sortOrder) {
        devices = lodash
          .orderBy(devices, sortKeys, sortOrder); // Use Lodash to sort array by 'name'
      } else {
        devices = lodash.orderBy(devices, ({ name }) => name || '', ['desc']);
      }
      util.setSuccess(200, devices);
    } else {
      const err = ErrorCodes['800012'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getADevice(req, res) {
    const { id } = req.params;
    let devices = null;
    // devices = await getOneFromCache(CacheKeys.DEVICES, id);
    // if (!devices) {
    devices = await DevicesService.getDevice(req);
    // }
    if (devices) {
      const request = { body: {} };
      request.body.name = devices.model;
      request.body.company_id = devices.company_id;
      const model = await ModelsService.getModel(request)
        .then((result) => result);
      if (model) {
        devices.description = model.description;
      } else {
        devices.description = null;
      }
      util.setSuccess(200, devices);
    } else {
      const err = ErrorCodes['800003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async deleteDevice(req, res) {
    const { device_id } = req.query;
    const { company_id } = req.body;
    const { occupant_id } = req;
    const { user_id } = req;
    const source_IP = req.source_IP;
    const devices = await DevicesService.deleteDevice(device_id, company_id, occupant_id, user_id, source_IP, req.request_id).catch((err) => {
      throw new ApplicationError(err);
    });
    util.setSuccess(200, devices);
    return util.send(req, res);
  }

  static async deleteGateway(req, res) {
    const { command, gateway_id } = req.query;
    const { company_id } = req.body;
    const { occupant_id } = req;
    const occupant_email = req.occupantDetails.email;
    const source_IP = req.source_IP;
    const request_id = req.request_id;
    const company = await getCompany(company_id, null).then((result) => (result)).catch((error) => {
      throw (error);
    });
    if (!company) {
      const err = ErrorCodes['000001'];
      throw new ApplicationError(err);
    }

    const devices = await DevicesService.deleteGateway(command, gateway_id, company_id,
      occupant_id, occupant_email, request_id, company.code, source_IP).catch((err) => {
        throw new ApplicationError(err);
      });

    util.setSuccess(200, devices);
    return util.send(req, res);
  }

  static async updateDevice(req, res) {
    const { id } = req.params;
    const updatedDevice = await DevicesService.updateDevice(
      req,
    ).catch((err) => {
      if (err.name && (err.name === 'SequelizeForeignKeyConstraintError' || err.name === 'SequelizeDatabaseError')) {
        const errorCode = ErrorCodes['800006'];
        throw new ApplicationError(errorCode);
      }
      const { error } = JSON.parse(err.message);
      const errorCode = ErrorCodes[error];
      throw new ApplicationError(errorCode);
    });
    if (updatedDevice) {
      util.setSuccess(200, updatedDevice);
    } else {
      const err = ErrorCodes['800005'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async updateBulkDevice(req, res) {
    const results = await DevicesService.updateBulkDevices(
      req,
    ).catch(() => {
      const err = ErrorCodes['800015'];
      throw new ApplicationError(err);
    });
    util.setSuccess(200, results);
    return util.send(req, res);
  }

  static async updateMultipleDevice(req, res) {
    const updatedDevices = await DevicesService.updateMultipleDevice(
      req,
    ).catch((err) => {
      if (err.name && (err.name === 'SequelizeForeignKeyConstraintError' || err.name === 'SequelizeDatabaseError')) {
        const errorCode = ErrorCodes['800006'];
        throw new ApplicationError(errorCode);
      }
      const { error } = JSON.parse(err.message);
      const errorCode = ErrorCodes[error];
      throw new ApplicationError(errorCode);
    });

    if (updatedDevices.length > 0) {
      util.setSuccess(200, updatedDevices);
    } else {
      const err = ErrorCodes['800005'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async unlinkGatewayLocation(req, res) {
    const { body } = req;
    if (body.location_id) { // id of location from which device is unlinked
      const rowCount = await DevicesService.unlinkGatewayLocation(req);
      util.setSuccess(200, { numberOfRowsUpdated: rowCount });
    } else {
      const err = ErrorCodes['150001'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async unlinkDeviceLocation(req, res) {
    let device = null;
    device = await DevicesService.getDevice(req);
    if (device != null) {
      if (device.gateway_id != null) {
        device.location_id = device.gateway.location_id;
        device.updated_by = req.user_id;
        const updatedDevice = await DevicesService.unlinkDeviceLocation(
          device, req,
        ).catch((err) => {
          if (err.name && (err.name === 'SequelizeForeignKeyConstraintError' || err.name === 'SequelizeDatabaseError')) {
            const errorCode = ErrorCodes['800006'];
            throw new ApplicationError(errorCode);
          }
          const { error } = JSON.parse(err.message);
          const errorCode = ErrorCodes[error];
          throw new ApplicationError(errorCode);
        });
        util.setSuccess(200, updatedDevice);
      } else {
        const err = ErrorCodes['800003'];
        throw new ApplicationError(err);
      }
    } else {
      const err = ErrorCodes['150002'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async linkGatewayLocation(req, res) {
    const { body } = req;
    const { ids } = req.body;
    if (ids.length <= 0) { // passing array to handle multiple gateway linking.
      const err = ErrorCodes['150004'];
      throw new ApplicationError(err);
    }
    if (!body.location_id) { // id of location to which gateway needed to be unlinked
      const err = ErrorCodes['150001'];
      throw new ApplicationError(err);
    }
    const updatedGateway = await DevicesService.linkGatewayLocation(req, ids)
      .catch((err) => {
        if (err.name && (err.name === 'SequelizeForeignKeyConstraintError' || err.name === 'SequelizeDatabaseError')) {
          const errorCode = ErrorCodes['800006'];
          throw new ApplicationError(errorCode);
        }
        const { error } = JSON.parse(err.message);
        const errorCode = ErrorCodes[error];
        throw new ApplicationError(errorCode);
      });
    util.setSuccess(200, updatedGateway);
    return util.send(req, res);
  }

  static async getParentLocationsDevices(req, res) {
    const devices = await DevicesService.getParentLocationsDevices(req)
      .catch((err) => {
        if (err.name && (err.name === 'SequelizeForeignKeyConstraintError' || err.name === 'SequelizeDatabaseError')) {
          const errorCode = ErrorCodes['800006'];
          throw new ApplicationError(errorCode);
        }
        const { error } = JSON.parse(err.message);
        const errorCode = ErrorCodes[error];
        throw new ApplicationError(errorCode);
      });
    util.setSuccess(200, devices);
    return util.send(req, res);
  }

  static async getSecondaryLocations(req, res) {
    const locations = await DevicesService.getSecondaryLocations(req)
      .catch((err) => {
        if (err.name && (err.name === 'SequelizeForeignKeyConstraintError' || err.name === 'SequelizeDatabaseError')) {
          const errorCode = ErrorCodes['800006'];
          throw new ApplicationError(errorCode);
        }
        const { error } = JSON.parse(err.message);
        const errorCode = ErrorCodes[error];
        throw new ApplicationError(errorCode);
      });
    if (locations) {
      util.setSuccess(200, locations);
    } else {
      const err = ErrorCodes['150005'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getHistory(req, res) {
    // take out the inputs and validate, if not assign default value.
    let { device_code, property_name, property_value, start_date,
      end_date, type, raw_data, page, limit, order } = req.query;
    const { company_id } = req.body;
    const { occupant_id } = req;
    const typeData = ['Normal', 'RollerShutter', 'OpenClose'];
    const orderType = ['asc', 'desc'];
    // type has one of mentioned 3 values only.
    type = (type && typeData.includes(type)) ? type : 'Normal'; // default normal 
    // there are 2 types of order by default the order will be asc
    order = (order && orderType.includes(order)) ? order : 'asc'; // default asc 

    raw_data = (raw_data) ? raw_data : false; // default false
    // pagination max size is 5000
    page = (page && page >= 0 && page <= 5000) ? page : 0; // max pagination size is 5000, min 0
    // page size
    limit = (limit && limit >= 1) ? limit : 1000; // limit default 1000

    const deviceHistory = await DevicesService.getHistory(device_code, property_name, property_value,
      start_date, end_date, type, raw_data, page, limit, order, company_id)
      .catch((err) => {
        console.log("🚀 ~ file: DevicesController.js:469 ~ DevicesController ~ getHistory ~ err:", err);
        throw new ApplicationError(err);
      });
    if (deviceHistory) {
      util.setSuccess(200, deviceHistory);
    } else {
      const err = ErrorCodes['280000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }
  static async getKibanaHistory(req, res) {
    // take out the inputs and validate, if not assign default value.
    let { device_code, property_name, property_value, start_date,
      end_date, type, raw_data, page, limit, order } = req.query;
    const { company_id } = req.body;
    const { occupant_id } = req;
    const orderType = ['asc', 'desc'];
    // type has one of mentioned 3 values only.
    // there are 2 types of order by default the order will be asc
    order = (order && orderType.includes(order)) ? order : 'asc'; // default asc 

    // pagination max size is 5000
    page = (page && page >= 0 && page <= 5000) ? page : 0; // max pagination size is 5000, min 0
    // page size
    limit = (limit && limit >= 1) ? limit : 1000; // limit default 1000

    const deviceHistory = await DevicesService.getKibanaHistory(device_code, property_name, property_value,
      start_date, end_date, page, limit, order, company_id)
      .catch((err) => {
        console.log("🚀 ~ file: DevicesController.js:469 ~ DevicesController ~ getHistory ~ err:", err);
        throw new ApplicationError(err);
      });
    if (deviceHistory) {
      util.setSuccess(200, deviceHistory);
    } else {
      const err = ErrorCodes['280000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }
  static async getDeviceShadows(req, res) {
    let { device_codes } = req.body;
    const { company_id } = req.body;
    const { occupant_id, identity_id } = req;
    const deviceShadows = await DevicesService.getDeviceShadows(device_codes, occupant_id, company_id, identity_id)
      .catch((err) => {
        throw new ApplicationError(err);
      });
    if (deviceShadows) {
      util.setSuccess(200, deviceShadows);
    } else {
      const err = ErrorCodes['290000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }
  static async getUserAnalytics(req, res) {
    let { table_name, device_code, time_span, start_date, end_date } = req.query;
    const { company_id } = req.body;

    const deviceUserAnalytics = await DevicesService.getUserAnalytics(table_name, device_code, time_span, start_date, end_date, company_id)
      .catch((err) => {
        throw new ApplicationError(err);
      });
    if (deviceUserAnalytics) {
      util.setSuccess(200, deviceUserAnalytics);
    } else {
      const err = ErrorCodes['290000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }
  static async CsvTolinkGatewayLocation(req, res) {
    if (req.file) {
      const pathOfCsv = path.join(__dirname, `../../public/uploads/${req.file.filename}`);
      const companyId = req.company_id;
      const createdBy = req.user_id;
      const updatedBy = req.user_id;
      const userId = req.user_id;
      const config = {
        deviceCode: 'deviceCode',
        locationName: 'locationName',
        path: 'path',
      };
      await CSVFileValidator(pathOfCsv, config)
        .then(async (result) => {
          const csvData = result;
          const gatewayList = JSON.stringify(csvData);
          if (csvData.length < 0) {
            const err = ErrorCodes['800017'];
            throw new ApplicationError(err);
          } else {
            const obj = csvData[0];
            if (!(('deviceCode' in obj) && ('locationName' in obj) && ('path' in obj))) {
              fs.unlinkSync(pathOfCsv);
              const error = ErrorCodes['800017'];
              throw new ApplicationError(error);
            }
          }
          const input = {
            gatewayList,
            userId,
          };
          const jobObj = {};
          const job = await jobsService.createJob(Entities.importGatewayLocations.entity_name,
            input, companyId, createdBy, updatedBy, null, req.request_id)
            .then(async (resp) => resp)
            .catch((err) => {
              throw (err);
            });
          jobObj.id = job.id;
          fs.unlinkSync(pathOfCsv);
          util.setSuccess(200, { jobObj });
          return util.send(req, res);
        })
        .catch(async (error) => {
          fs.unlinkSync(pathOfCsv);
          res.status(422).send({
            code: 422,
            message: `Could not upload the file. ${error}`,
            request_id: req.request_id,
          });
        });
    } else {
      const err = ErrorCodes['800016'];
      throw new ApplicationError(err);
    }
  }

  static async checkGatewayExist(req, res) {
    var { bluetooth_id, mdns_id } = req.body
    const devices = await DevicesService.checkGatewayExist(
      bluetooth_id, mdns_id, req.occupant_id
    ).catch((error) => {
      throw new ApplicationError(error);
    });
    util.setSuccess(200, devices);
    return util.send(req, res);
  }

  static async gatewayCameraLink(req, res) {
    var { camera_device_ids, gateway_id } = req.body
    const { occupant_id, company_id, user_id, source_IP } = req;
    const devices = await DevicesService.gatewayCameraLink(camera_device_ids, gateway_id, occupant_id, company_id, user_id, req.occupantDetails.identity_id, source_IP)
      .catch((error) => {
        throw new ApplicationError(error);
      });
    util.setSuccess(200, devices);
    return util.send(req, res);
  }

  static async gatewayCameraPlanLink(req, res) {
    var { camera_device_id, gateway_id, active } = req.body
    const { occupant_id, company_id, user_id, source_IP } = req;
    const devices = await DevicesService.gatewayCameraPlanLink(camera_device_id, gateway_id, occupant_id, company_id, user_id, active, req.occupantDetails.identity_id, source_IP)
      .catch((error) => {
        throw new ApplicationError(error);
      });
    util.setSuccess(200, devices);
    return util.send(req, res);
  }

  static async gatewayCameraList(req, res) {
    var { gateway_id, gateway_code } = req.query;
    const { occupant_id, user_id } = req;
    const devices = await DevicesService.gatewayCameraList(gateway_id, gateway_code, occupant_id, user_id).catch((error) => {
      throw new ApplicationError(error);
    });
    util.setSuccess(200, devices);
    return util.send(req, res);
  }

  static async setGatewayImage(req, res) {
    const { gateway_id } = req.body;
    const imagePath = path.join(__dirname, `../../../public/uploads/${req.file.filename}`);
    const key = req.file.originalname;
    const setGatewayImage = await DevicesService.setGatewayImage(gateway_id, imagePath, key).catch((error) => {
      throw new ApplicationError(error);
    });
    util.setSuccess(200, setGatewayImage);
    return util.send(req, res);

  }

  static async uploadFileOneTouch(req, res) {
    const { token, company_code } = req.query;
    const { occupant_id, user_id } = req;
    if (!req.file) {
      const err = ErrorCodes['470002'];
      throw new ApplicationError(err);
    }
    const filePath = path.join(__dirname, `../../../public/uploads/${req.file.filename}`);
    const key = req.file.originalname;

    // get company data from cache else set in cache     
    const company = await getCompany(null, company_code).then(result => {
      return (result);
    }).catch((error) => {
      throw (error);
    });
    if (!company) {
      const err = ErrorCodes['000001'];
      throw new ApplicationError(err);
    }
    const company_id = company.id;
    const source_IP = req.source_IP;
    const data = await DevicesService.uploadFileOneTouch(token, company_id, filePath, occupant_id, user_id, source_IP).catch((error) => {
      throw new ApplicationError(error);
    });
    util.setSuccess(200, data);
    return util.send(req, res);
  }

  static async uploadFileSchedules(req, res) {
    const { token, company_code } = req.query;
    const { occupant_id, user_id, source_IP } = req;
    if (!req.file) {
      const err = ErrorCodes['470002'];
      throw new ApplicationError(err);
    }
    const filePath = path.join(__dirname, `../../../public/uploads/${req.file.filename}`);
    const key = req.file.originalname;

    // get company data from cache else set in cache    
    const company = await getCompany(null, company_code).then(result => {
      return (result);
    }).catch((error) => {
      throw (error);
    });
    if (!company) {
      const err = ErrorCodes['000001'];
      throw new ApplicationError(err);
    }
    const company_id = company.id;
    const data = await DevicesService.uploadFileSchedules(token, company_id, filePath, occupant_id, user_id, source_IP).catch((error) => {
      throw new ApplicationError(error);
    });
    util.setSuccess(200, data);
    return util.send(req, res);
  }

  static async localCloudSyncup(req, res) {
    var { gateway_id } = req.body
    const { occupant_id, company_id, user_id, source_IP } = req;

    const response = await DevicesService.localCloudSyncup(gateway_id, occupant_id, company_id, source_IP)
      .catch((error) => {
        throw new ApplicationError(error);
      });
    util.setSuccess(200, response);
    return util.send(req, res);
  }
  static async getPinCodeDetails(req, res) {
    var { pincode } = req.query
    const devices = await DevicesService.getPinCodeDetails(pincode)
      .catch((err) => {
        const { error } = JSON.parse(err.message);
        const errorCode = ErrorCodes[error];
        throw new ApplicationError(errorCode);
      });
    util.setSuccess(200, devices);
    return util.send(req, res);
  }
  static async updateGatewaySettings(req, res) {
    var { gateway_id,global_time_format_24_hour } = req.body
    const { occupant_id,company_id, user_id, source_IP } = req;
    const devices = await DevicesService.updateGatewaySettings(gateway_id,occupant_id,global_time_format_24_hour,company_id)
      .catch((err) => {
        const { error } = JSON.parse(err.message);
        const errorCode = ErrorCodes[error];
        throw new ApplicationError(errorCode);
      });
    util.setSuccess(200, devices);
    return util.send(req, res);
  }
}

export default DevicesController;
