import LocationTypesService from '../services/LocationTypesService';
import Util from '../../utils/Utils';
import {
  setInCache,
  getLocationTypesFromCache,
  getOneFromCache,
  deleteFromCache,
} from '../../cache/Cache';
import CacheKeys from '../../cache/Constants';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';

const util = new Util();

class LocationTypesController {
  static async createLocationType(req, res) {
    const locationType = await LocationTypesService.createLocationType(
      req.body,
      req,
    ).catch(() => {
      const err = ErrorCodes['400000'];
      throw new ApplicationError(err);
    });
    setInCache(CacheKeys.LOCATION_TYPES, locationType.id, locationType);
    util.setSuccess(200, locationType);
    return util.send(req, res);
  }

  static async getAllLocationTypes(req, res) {
    let locationTypes = null;
    locationTypes = await getLocationTypesFromCache(req);
    if (locationTypes && locationTypes.length <= 0) {
      locationTypes = await LocationTypesService.getAllLocationTypes(
        req.body.company_id,
      );
    }
    if (locationTypes && locationTypes.length > 0) {
      util.setSuccess(200, locationTypes);
    } else {
      const err = ErrorCodes['400001'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getALocationType(req, res) {
    const { id } = req.params;
    let locationType = null;
    locationType = await getOneFromCache(CacheKeys.LOCATION_TYPES, id);
    if (!locationType) {
      locationType = await LocationTypesService.getLocationType(id);
    }
    if (locationType) {
      util.setSuccess(200, locationType);
    } else {
      const err = ErrorCodes['400002'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async deleteLocationType(req, res) {
    const { id } = req.params;
    const locationType = await LocationTypesService.deleteLocationType(id, req);
    if (locationType) {
      await deleteFromCache(CacheKeys.LOCATION_TYPES, id);
      util.setSuccess(200);
    } else {
      const err = ErrorCodes['400003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async updateLocationType(req, res) {
    const { id } = req.params;
    const updatedLocationType = await LocationTypesService.updateLocationType(
      req.body,
      id,
      req,
    );
    if (updatedLocationType) {
      setInCache(CacheKeys.LOCATION_TYPES, id, updatedLocationType);
      util.setSuccess(200, updatedLocationType);
    } else {
      const err = ErrorCodes['400004'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }
}

export default LocationTypesController;
