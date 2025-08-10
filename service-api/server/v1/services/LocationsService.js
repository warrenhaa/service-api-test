import { Op } from 'sequelize';
import lodash from 'lodash';
import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import locationTypesService from './LocationTypesService';
import locationLevels from '../../utils/constants/LocationTypes';
import Logger from '../../utils/Logger';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';
import DevicesService from './DevicesService';
import jobsService from './JobsService';
import Responses from '../../utils/constants/Responses';
import CacheKeys from '../../cache/Constants';
import { getAllFromCache, setInCache } from '../../cache/Cache';

const { QueryTypes } = database.Sequelize;

class LocationsService {

  static async createLocations(body) {
    let path = {};
    let newLocType = await locationTypesService.getLocationType(body.type_id);
    const checkQuery = {};
    checkQuery.name = body.name;
    checkQuery.type_id = body.type_id;
    if (locationLevels.includes(newLocType.name)) {
      if (newLocType.name !== locationLevels[0] && body?.container_id) {
        checkQuery.container_id = body.container_id;
      }
      if (body.zip_code) {
        let locationExists = await database.locations.findAll({
          where: checkQuery,
          include: [
            {
              model: database.addresses,
              where: {
                zip_code: body.zip_code
              }
            }
          ],
          raw: true,
        });
        if (locationExists?.length > 0) {
          const err = ErrorCodes['170005'];
          throw new ApplicationError(err);
        }
      }
    }
    if (body.container_id) {
      const container = await database.locations.findOne({
        where: {
          id: body.container_id,
        },
        include: [
          {
            model: database.location_types,
            required: true,
            as: 'location_type',
          },
        ],
        returning: true,
        raw: true,
      });
      const pathMap = {};
      const locationType = container['location_type.name'];
      pathMap[locationType] = container.name;
      path = container.path ? { ...container.path } : {};
      path[container.id] = pathMap;

      let obj = {};
      Object.keys(path).forEach((key) => {
        obj = { ...obj, ...path[key] };
      });
      let breadcrumb = '';
      locationLevels.forEach((element) => {
        if (element in obj) {
          breadcrumb = `${breadcrumb}/${obj[element]}`;
        }
      });
      breadcrumb = `${breadcrumb}/${body.name}`;
      path.breadcrumb = breadcrumb;
    } else {
      path.breadcrumb = body.name;
    }
    const locations = await database.locations.create({
      company_id: body.company_id,
      name: body.name,
      notes: body.notes,
      container_id: body.container_id,
      address_id: body.address_id,
      type_id: body.type_id,
      created_by: body.user_id,
      updated_by: body.user_id,
      path,
      timezone: body.timezone,
    });
    let obj = {
      old: {},
      new: locations
    };
    ActivityLogs.addActivityLog(Entities.locations.entity_name, Entities.locations.event_name.created,
      obj, Entities.notes.event_name.added, locations.id, body.company_id, body.user_id, null);
    if (locations.container_id) {
      ActivityLogs.addActivityLog(Entities.locations.entity_name, Entities.locations.event_name.added,
        obj, Entities.notes.event_name.added, locations.container_id, body.company_id, body.user_id, null);
    }
    return locations;
  }

  static async getAllLocations(req) {
    const companyId = req.body.company_id;
    const containerId = req.query.container_id;
    const query = {};
    query.company_id = companyId;
    if (containerId) {
      const queryStr = 'select id from locations where path ? :locationId'
      let ids = await database.sequelize.query(queryStr,
        {
          raw: true,
          replacements: { locationId: containerId },
          logging: console.log,
          type: QueryTypes.SELECT
        },
      );
      ids = lodash.map(ids, (ele) => ele.id);
      ids = [...ids, containerId];
      query.id = ids;
    }
    const locations = await database.locations.findAll({
      include: [
        {
          model: database.location_types,
          required: true,
          as: 'location_type',
        },
        {
          model: database.addresses,
          required: true,
          as: 'address',
        },
      ],
      where: query,
      raw: true,
      nest: true,
    });
    return locations;
  }

  static async getLocation(id) {
    const location = await database.locations.findOne({
      include: [
        {
          model: database.location_types,
          required: true,
          as: 'location_type',
        },
        {
          model: database.addresses,
          as: 'address',
        },
      ],
      where: { id },
      raw: true,
      nest: true,
    });
    return location;
  }

  static async updateLocation(updatedLocation, id, userId) {
    let oldObj = {};
    let newObj = {};
    let locationUpdated = {};
    const locationToUpdate = await database.locations.findOne({
      include: [{ model: database.addresses }],
      where: { id },
    });
    if (!locationToUpdate) return null;
    /* logic to check duplicate location with name and zipcode*/
    let locType = await locationTypesService.getLocationType(updatedLocation.type_id);
    const checkQuery = {};
    checkQuery.name = updatedLocation.name;
    checkQuery.type_id = updatedLocation.type_id;
    checkQuery.id = {
      [Op.not]: id,
    }
    if (locationLevels.includes(locType.name)) {
      if (locType.name !== locationLevels[0] && updatedLocation?.container_id) {
        checkQuery.container_id = updatedLocation.container_id;
      }
      let locationExists = await database.locations.findAll({
        where: checkQuery,
        include: [
          {
            model: database.addresses,
            where: {
              zip_code: updatedLocation.zip_code
            }
          }
        ],
        raw: true,
      });
      if (locationExists?.length > 0) {
        const err = ErrorCodes['170005'];
        throw new ApplicationError(err);
      }
    }
    /*end*/
    const { path } = locationToUpdate;
    if (locationToUpdate) {
      const locations = locationToUpdate.toJSON();
      const locationType = await database.location_types.findOne({
        where: { id: locations.type_id },
        plain: true,
      });

      if ('name' in updatedLocation && locationType.name !== 'site') {
        let obj = {};
        Object.keys(path).forEach((key) => {
          obj = { ...obj, ...path[key] };
        });
        let breadcrumb = '';
        locationLevels.forEach((element) => {
          if (element in obj) {
            breadcrumb = `${breadcrumb}/${obj[element]}`;
          }
        });
        breadcrumb = `${breadcrumb}/${updatedLocation.name}`;
        path.breadcrumb = breadcrumb;
      }
      if (locationType.name === 'site') {
        if ('name' in updatedLocation) path.breadcrumb = `${updatedLocation.name}`;
      }
      const locationBody = { ...updatedLocation };

      locationBody.path = { ...path };
      let updateLocation = {}

      if (updatedLocation.name || updatedLocation.notes) {
        updateLocation = await database.locations.update(locationBody, {
          where: { id },
          returning: true,
          raw: true,
          attributes: { exclude: ['type_id'] },
        }).then((result) => {
          return result[1][0];
        });
        Object.keys(locationBody).forEach(function (key) {
          if (updateLocation.hasOwnProperty(key) && JSON.stringify(locationToUpdate[key]) != JSON.stringify(updateLocation[key])) {
            oldObj[key] = locationToUpdate[key];
            newObj[key] = updateLocation[key];
          }
        });
      }
      const addressBody = { ...updatedLocation };
      delete addressBody['company_id', 'name', 'type_id', 'notes', 'container_id']

      if (Object.keys(addressBody).length > 0) {
        const updateAddress = await database.addresses.update(addressBody, {
          where: { id: locations.address_id },
          returning: true,
          raw: true,
        }).then((result) => {
          return result[1][0];
        })
        oldObj.address = {}
        newObj.address = {}
        Object.keys(addressBody).forEach(function (key) {
          if (updateAddress.hasOwnProperty(key) && JSON.stringify(locationToUpdate.address[key]) != JSON.stringify(updateAddress[key])) {
            oldObj.address[key] = locationToUpdate.address[key];
            newObj.address[key] = updateAddress[key];
          }
        });
        if (Object.keys(oldObj.address).length < 1) {
          delete oldObj['address']
        }
        if (Object.keys(newObj.address).length < 1) {
          delete newObj['address']
        }
        let address_obj = {
          old: oldObj.address,
          new: newObj.address,
        }
        ActivityLogs.addActivityLog(Entities.addresses.entity_name, Entities.addresses.event_name.updated,
          address_obj, Entities.notes.event_name.updated, locationToUpdate.address_id, updatedLocation.company_id, userId, null);
      }
      let obj = {
        old: oldObj,
        new: newObj
      };
      ActivityLogs.addActivityLog(Entities.locations.entity_name, Entities.locations.event_name.updated,
        obj, Entities.notes.event_name.updated, id, updatedLocation.company_id, userId, null);

      locationUpdated = await this.getLocation(id);
      locationUpdated.location_type = locationType;
      const locationUpdateData = { ...locationUpdated };
      locationUpdateData.oldName = locationToUpdate.dataValues.name;
      //  PathQueue.add(locationUpdateData);
      const updateChildrens = await this.updatePath(locationUpdateData);
      return locationUpdated;
    }
    return null;
  }

  static async updatePath(data) {
    const locationId = data.id;
    const locationType = data.location_type;
    const typeName = locationType.name;
    const query = {};
    const key = `path.${locationId}.${typeName}`;
    query[key] = data.oldName;
    const childLocations = await database.locations.findAll({ where: query, raw: true });
    childLocations.forEach(async (location) => {
      const locationTypes = await database.location_types.findOne({
        where: { id: location.type_id },
        plain: true,
      });
      const childLocationId = location.id;
      const updatedPath = { ...location.path };
      const typeMap = {};
      typeMap[typeName] = data.name;
      updatedPath[locationId] = typeMap;
      let obj = {};
      if (updatedPath.breadcrumb) delete updatedPath.breadcrumb;
      const childLocationTypeName = locationTypes.name;
      const childTypeMap = {};
      childTypeMap[childLocationTypeName] = location.name;
      updatedPath[childLocationId] = childTypeMap;
      Object.keys(updatedPath).forEach((keyPath) => {
        obj = { ...obj, ...updatedPath[keyPath] };
      });
      let breadcrumb = '';
      locationLevels.forEach((element) => {
        if (element in obj) {
          breadcrumb = `${breadcrumb}/${obj[element]}`;
        }
      });
      updatedPath.breadcrumb = breadcrumb;
      delete updatedPath.childLocationId;
      const updatedData = await database.locations.update({ path: updatedPath }, {
        where: { id: childLocationId },
        returning: true,
        plain: true,
      }).then((results) => results[1].dataValues);
      const updateAddress = await database.addresses.findOne({
        where: { id: location.address_id },
        returning: true,
        raw: true,
      });
      updatedData.address = updateAddress;
      updatedData.location_type = locationTypes;

      await setInCache(CacheKeys.LOCATIONS, updatedData.id, updatedData);
    });

    // get all devices linked to location and remove cache to update the new location
    const allDevices = await getAllFromCache(CacheKeys.DEVICES);
    const devices = lodash.filter(allDevices, { location_id: locationId });
    devices.forEach(async (device) => {
      const params = {
        params: {
          id: device.id,
        },
      };
      const deviceQuery = { ...params };
      const updatedDevice = await DevicesService.getDevice(deviceQuery);
      await setInCache(CacheKeys.DEVICES, updatedDevice.id, updatedDevice);
    });
  }

  static async deleteLocation(id, req) {
    const companyId = req.body.company_id;
    const createdBy = req.user_id;
    const updatedBy = req.user_id;
    const location = await database.locations.findOne({
      include: [
        {
          model: database.location_types,
          required: false,
          as: 'location_types',
        },
      ],
      where: { id },
      raw: true,
    });
    if (location) {
      const queryOccupantList = `SELECT d.* FROM occupants_locations d WHERE d.location_id IN ( SELECT id FROM locations WHERE id IN (:locationIds) OR path ? :locationIds )`;
      const occupantList = await database.sequelize.query(queryOccupantList, {
        raw: true,
        replacements: {
          locationIds: [id],
        },
        logging: console.log,
        model: database.occupants_locations,
      });
      var isError = false
      if (occupantList && occupantList.length > 0) {
        occupantList.forEach(async (data) => {
          if (data.status === 'checked in' || data.status === 'invited' || data.status === 'default') {
            isError = true
          }
        });
      }
      if (isError == true) {
        const err = ErrorCodes['170006'];
        throw err;
      }
      let locationData = JSON.stringify(location);
      let adminData = await DevicesService.getAdminData(req.company_id);
      const input = {
        locationData,
        location_id: id,
        userId: req.user_id,
        adminData
      };
      const jobObj = {};
      const job = await jobsService.createJob(Entities.jobs.event_name.delete_location, input, companyId, createdBy, updatedBy)
        .then(async (resp) => resp)
        .catch((err) => {
          throw (err);
        });
      jobObj.jobId = job.id;
      jobObj.message = Responses.responses.location_delete_job_message;
      return (jobObj);
    }
    return null;
  }

  static async getRoleByLocationId(locationId, userId) {
    const queryStr = `SELECT Distinct role FROM locations_permissions WHERE user_id= :userId 
        AND ( location_id =:locationId OR location_id IN (SELECT id FROM locations WHERE path ? :locationId))`;
    let userRole = null;
    try {
      userRole = await database.sequelize.query(queryStr,
        {
          raw: true,
          replacements: { locationId, userId },
          logging: console.log,
          type: QueryTypes.SELECT
        },
      );
      if (userRole.length <= 0) {
        Logger.error(`No permission found with userId: ${userId} and locationId : ${locationId}`);
        const err = ErrorCodes['150006'];
        return { isError: true, error: err };
      }
      return userRole[0];
    }
    catch (error) {
      Logger.error(`getRoleByLocationId - error : ${error}`);
      return { isError: true, error };
    }
  }
}

export default LocationsService;
