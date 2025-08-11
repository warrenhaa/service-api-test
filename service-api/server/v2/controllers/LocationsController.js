import LocationsService from '../services/LocationsService';
import LocationTypesService from '../services/LocationTypesService';
import AddressesService from '../services/AddressesService';
import AccessPermissionService from '../services/AccessPermissionService';
import { createLocationPermission } from '../helpers/RecursiveLocation';
import CorePermissionsMappingService from '../services/CorePermissionsMappingService';
import Util from '../../utils/Utils';
import {
  setInCache,
  deleteFromCache,
  getOneFromCache,
} from '../../cache/Cache';
import CacheKeys from '../../cache/Constants';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';
import jobsService from '../services/JobsService';
import Entities from '../../utils/constants/Entities';
import checkAllDevicesAccess from '../helpers/CheckAllDeviceAccess';

const path = require('path');

const CSVFileValidator = require('csv-validator');

const fs = require('fs');

const util = new Util();

class LocationsController {
  static async createLocation(req, res) {
    const addressDetails = await AddressesService.createAddress(req.body, req);
    req.body.address_id = addressDetails.id;
    req.body.user_id = req.user_id;
    req.body.source_IP = req.source_IP;
    const location = await LocationsService.createLocations(req.body).then(
      async (result) => {
        const locationTypes = await LocationTypesService.getLocationType(
          result.dataValues.type_id,
        );
        let mergedLocation = {};
        mergedLocation = result.toJSON();
        mergedLocation.address = addressDetails;
        mergedLocation.location_type = locationTypes.toJSON();
        return mergedLocation;
      },
    ).catch((errs) => {
      console.info('>>>>>>>>>', errs);
      if (errs.responseCode === '170005') {
        throw errs;
      }
      const err = ErrorCodes['500001'];
      throw new ApplicationError(err);
    });
    if (location.location_type.name !== 'site') {
      await createLocationPermission(location);
    }
    const isAdmin = await checkAllDevicesAccess({ companyId: req.company_id, userId: req.user_id });
    if (!isAdmin) {
      const permission = {};
      permission.user_id = req.user_id;
      const permissions = {};
      const sitePermissions = [];
      sitePermissions.push(location.id);
      permissions.site_permissions = sitePermissions;
      permission.permissions = permissions;
      permission.company_id = req.company_id;
      const userPermissions = [];
      userPermissions.push(permission);
      userPermissions.map(async (userPermission) => {
        await AccessPermissionService.addAccessPermissions(userPermission).then(async (permission) => {
          await deleteFromCache(CacheKeys.USER_PERMISSIONS, userPermission.user_id);
        }).catch((error) => {
          var error = ErrorCodes['300005'];
          throw error;
        });
      });
    }
    util.setSuccess(200, location);
    return util.send(req, res);
  }

  static async getAllLocations(req, res) {
    const userDetail = {};
    userDetail.query = {};
    userDetail.query.company_id = req.body.company_id;
    const corePerm = await CorePermissionsMappingService.getCorePermissionMappings(
      {
        name: 'device_visibility',
        company_id: req.body.company_id,
      },
    );
    const permission = await AccessPermissionService.getAccessCorePermissions(
      {
        core_permission_mapping_id: corePerm.id,
        user_id: req.user_id,
        company_id: req.body.company_id,
      },
    );
    let userLocations = null;
    if (permission !== null
      && permission !== 'null'
      && typeof permission.device_visibility !== 'undefined'
      && permission.device_visibility.indexOf(corePerm.access_levels[1]) > -1) { // assuming 1th element is for all device permission
      userLocations = await LocationsService.getAllLocations(req);
    } else {
      userDetail.query.user_id = req.user_id;
      userLocations = await AccessPermissionService.getAllLocationsOfUser(userDetail);
    }
    userLocations = userLocations.filter((x) => x !== null);
    if (userLocations && userLocations.length > 0) {
      util.setSuccess(200, userLocations);
    } else {
      const err = ErrorCodes['500000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getALocation(req, res) {
    const { id } = req.params;
    const locations = await LocationsService.getLocation(id);
    if (locations) {
      util.setSuccess(200, locations);
    } else {
      const err = ErrorCodes['500002'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async deleteLocation(req, res) {
    const { id } = req.params;
    console.log('🚀 ~ file: LocationsController.js ~ line 131 ~ LocationsController ~ deleteLocation ~ id', id);
    const locations = await LocationsService.deleteLocation(id, req);
    if (locations) {
      util.setSuccess(200, locations);
    } else {
      const err = ErrorCodes['500003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async updateLocation(req, res) {
    const { id } = req.params;
    const locationUpdated = await LocationsService.updateLocation(
      req.body,
      id,
      req.user_id,
      req.source_IP,
    );
    if (locationUpdated) {
      util.setSuccess(200, locationUpdated);
    } else {
      const err = ErrorCodes['500004'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getUsersOfLocation(req, res) {
    const userLocations = await AccessPermissionService.getUsersOfLocation(req);
    util.setSuccess(200, userLocations);
    return util.send(req, res);
  }

  static async getRoleByLocationId(req, res) {
    const { id, userId } = req.params;
    const userRole = await LocationsService.getRoleByLocationId(id, userId);
    if (!userRole.isError) {
      util.setSuccess(200, userRole);
    } else {
      throw new ApplicationError(userRole.error);
    }
    return util.send(req, res);
  }

  static async importCsvForLocation(req, res) {
    if (req.file) {
      const pathOfCsv = path.join(__dirname, `../../public/uploads/${req.file.filename}`);
      const companyId = req.company_id;
      const createdBy = req.user_id;
      const updatedBy = req.user_id;
      const userId = req.user_id;
      const config = {
        id: 1,
        name: 'name',
        type: 'site',
        _address_line_1: 'line_1',
        _address_line_2: 'line_2',
        _address_line_3: 'line_3',
        _city: 'city',
        _state: 'state',
        _country: 'country',
        _geo_location: 'geo_location',
        _total_area: 'total_area',
        _parent_path: 'parent_path',
        _timezone: '',
      };
      await CSVFileValidator(pathOfCsv, config)
        .then(async (result) => {
          const csvData = result;
          const locationList = JSON.stringify(csvData);
          if (csvData.length < 0) {
            const err = ErrorCodes['500006'];
            throw new ApplicationError(err);
          } else {
            const obj = csvData[0];
            if (!(('id' in obj) && ('name' in obj) && ('type' in obj) && ('address_line_1' in obj)
              && ('address_line_2' in obj) && ('address_line_3' in obj) && ('city' in obj)
              && ('state' in obj) && ('country' in obj) && ('zip_code' in obj) && ('geo_location' in obj)
              && ('area' in obj) && ('parent_path' in obj) && ('timezone' in obj) && ('notes' in obj))) {
              fs.unlinkSync(pathOfCsv);
              const error = ErrorCodes['500006'];
              throw new ApplicationError(error);
            }
          }
          const input = {
            locationList,
            userId,
          };
          const jobObj = {};
          const job = await jobsService.createJob(Entities.importLocations.entity_name,
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
      const err = ErrorCodes['500005'];
      throw new ApplicationError(err);
    }
  }
}

export default LocationsController;
