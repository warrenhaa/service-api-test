import lodash from 'lodash';
import { QueryTypes } from 'sequelize';
import database from '../../models';
import CorePermissionService from './CorePermissionService';
import LocationPermissionsService from './LocationPermissionsService';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import { recursiveLocationPermission } from '../helpers/RecursiveLocation';
import {
  setInCache,
} from '../../cache/Cache';
import CacheKeys from '../../cache/Constants';
import Logger from '../../utils/Logger';

class AccessPermissionService {
  static async getAccessCorePermissions(query) {
    const user = await database.users.findOne({ where: { id: query.user_id } });
    if (!user) {
      return null;
    }
    const corePermission = await database.core_permissions
      .findAll({
        include: [
          {
            model: database.core_permissions_mappings,
          },
        ],
        where: query,
        raw: true,
      })
      .then((corePermissions) => {
        const permission = corePermissions.map((element) => {
          const key = element['core_permissions_mapping.name'];
          const value = element.access_level;
          const permissionDict = {};
          permissionDict[key] = value;
          return permissionDict;
        });
        const permissionObject = {};
        permission.forEach((item) => {
          const key = Object.keys(item);
          if (!permissionObject[key]) {
            permissionObject[key] = [];
          }
          permissionObject[key].push(item[key]);
        });
        return permissionObject;
      });
    return corePermission;
  }

  static async getAccessPermissions(req) {
    const user = await database.users.findOne({ where: { id: req.params.id } });
    if (!user) {
      return null;
    }
    const corePermission = await database.core_permissions
      .findAll({
        include: [
          {
            model: database.core_permissions_mappings,
          },
        ],
        where: {
          user_id: req.params.id,
          company_id: req.body.company_id,
        },
        raw: true,
      })
      .then((corePermissions) => {
        const permission = corePermissions.map((element) => {
          const key = element['core_permissions_mapping.name'];
          const value = element.access_level;
          const permissionDict = {};
          permissionDict[key] = value;
          return permissionDict;
        });
        const permissionObject = {};
        permission.forEach((item) => {
          const key = Object.keys(item);
          if (!permissionObject[key]) {
            permissionObject[key] = [];
          }
          permissionObject[key].push(item[key]);
        });
        return permissionObject;
      });
    const locationPermission = await database.locations_permissions
      .findAll({
        include: [
          {
            model: database.locations,
            include: [
              {
                model: database.location_types,
                required: true,
              },
            ],
          },
        ],
        where: {
          user_id: req.params.id,
          company_id: req.body.company_id,
        },
        raw: true,
      })
      .then((locationsPermissions) => {
        const resp = locationsPermissions;
        const sites = lodash.filter(resp, [
          'location.location_type.name',
          'site',
        ]);
        return sites.map((value) => {
          const locationID = value['location.id'];
          const dict = {};
          const building = lodash.filter(resp, [
            'location.location_type.name',
            'building',
          ]);
          const buildingNew = lodash.filter(building, [
            'location.container_id',
            locationID,
          ]);
          const area = lodash.filter(resp, [
            'location.location_type.name',
            'area',
          ]);
          const areaNew = lodash.filter(area, [
            'location.container_id',
            locationID,
          ]);
          const areaDict = {};
          areaNew.forEach((values) => {
            const areaid = values['location.id'];
            const streets = lodash.filter(resp, [
              'location.location_type.name',
              'street',
            ]);
            const streetOfId = lodash.filter(streets, [
              'location.container_id',
              areaid,
            ]);
            areaDict[areaid] = streetOfId;
          });
          dict[locationID] = {};
          dict[locationID].building = buildingNew;
          dict[locationID].area = areaDict;
          dict[locationID].role = value.role;
          return dict;
        });
      });
    return {
      core_permissions: corePermission,
      site_permissions: locationPermission,
    };
  }

  static async addAccessPermissions(body, req) {
    const permissionBody = body;
    const permissions = [];
    if (permissionBody.permissions.core_permissions) {
      const corePermissions = await CorePermissionService.addCorePermissions(
        permissionBody,
      ).catch((err) => {
        console.log(err);
      });
      permissions.push(corePermissions);
    }
    if (permissionBody.permissions.site_permissions) {
      const locationPermissions = await LocationPermissionsService.addLocationPermissions(
        permissionBody, req,
      ).catch((err) => {
        console.log(err);
      });
      permissions.push(locationPermissions);
      const recursivePermission = await recursiveLocationPermission(locationPermissions);
    }
    const user = {};
    user.params = {};
    user.body = {};
    user.params.id = body.user_id;
    user.body.company_id = body.company_id;
    const userPermissions = await this.getAccessPermissions(user);
    await setInCache(CacheKeys.USER_PERMISSIONS, body.user_id, userPermissions);
    return userPermissions;
  }

  static async updateAccessPermissions(req) {
    const permissionBody = req.body;
    const permissions = [];
    if (permissionBody.permissions.core_permissions) {
      const corePermissions = await CorePermissionService.updateCorePermission(
        req,
      );
      permissions.push(corePermissions);
    }
    if (permissionBody.permissions.site_permissions) {
      const locationPermissions = await LocationPermissionsService.updateLocationPermissions(
        permissionBody,
      );
      permissions.push(locationPermissions);
      const locPermissions = [];
      locPermissions.push(locationPermissions);
      const recursivePermission = await recursiveLocationPermission(locationPermissions);
    }
    const user = {};
    user.params = {};
    user.body = {};
    user.params.id = req.body.user_id;
    user.body.company_id = req.body.company_id;
    const userPermissions = await this.getAccessPermissions(user);
    await setInCache(CacheKeys.USER_PERMISSIONS, req.body.user_id, userPermissions);
    return userPermissions;
  }

  static async deleteAccessPermissions(id, req) {
    const { body } = req;
    const permissionToDelete = await database.access_permissions.findOne({
      where: { id },
    });
    if (permissionToDelete) {
      const deletedPermission = await database.access_permissions.destroy({
        where: { id },
      });
      const obj = {
        old: permissionToDelete,
        new: {},
      };
      ActivityLogs.addActivityLog(Entities.permissions.entity_name, Entities.permissions.event_name.deleted,
        obj, Entities.notes.event_name.deleted, permissionToDelete.id, body.company_id, body.user_id, null, null, null);
      return deletedPermission;
    }
    return null;
  }

  static async getAllLocationsOfUser(req) {
    const locations = await database.locations_permissions.findAll({
      attributes: ['id', 'company_id', 'user_id'],
      where: req.query,
      include: [
        {
          model: database.locations,
          attributes: { exclude: ['company_id'] },
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
        },
      ],
      raw: true,
      nest: true,
    }).then(async (userLocation) => {
      const locationData = userLocation.map((ul) => ul.location);
      const userLocations = [...new Set(locationData)];
      const paths = lodash.map(userLocations, 'path');
      const reducedPath = paths.reduce(((r, c) => Object.assign(r, c)), {});
      const locIds = lodash.map(userLocations, 'id');
      const locationIds = [...new Set(locIds)];
      const fullPath = { ...reducedPath };
      if (fullPath.breadcrumb) delete fullPath.breadcrumb;
      const idArray = Object.keys(fullPath);
      const difference = lodash.difference(idArray, locationIds);
      const diffLocation = await Promise.all(difference
        .map(async (diff) => database.locations.findOne({
          where: {
            id: diff,
          },
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
        })));
      const finalLocations = [...userLocations, ...diffLocation];
      return finalLocations;
    });
    return locations;
  }

  static async getLocationsOfUser(req) {
    const userCheck = await database.users.findOne({
      where: {
        id: req.query.user_id,
      },
      raw: true,
    });
    if (!userCheck) {
      throw Error(JSON.stringify({ error: '900004' }));
    }
    const query = `select l.*, lt.name as type, lp.role from locations l 
      inner join locations_permissions lp 
      on lp.location_id = l.id and lp.user_id= :user_id 
      inner join location_types lt on lt.id = l.type_id`;
    let result = null;
    try {
      result = await database.sequelize.query(query, {
        replacements: {
          user_id: req.query.user_id,
        },
        logging: console.log,
        raw: true,
        nest: true,
        type: QueryTypes.SELECT,
      });
      return result;
    } catch (error) {
      Logger.error(`getLocationsOfUser error :  ${error}`);
    }
  }

  static async checkCreateUserAccess(req) {
    let hasPermission = false;
    const usersCoreMappingId = await database.core_permissions_mappings.findOne({
      where: {
        company_id: req.companyId,
        name: 'users',
      },
    });
    if (usersCoreMappingId) {
      const createPermission = await database.core_permissions.findOne({
        where: {
          user_id: req.user_id,
          core_permission_mapping_id: usersCoreMappingId,
        },
      });
      if (createPermission) {
        hasPermission = true;
      }
    }
    return hasPermission;
  }
}

export default AccessPermissionService;
