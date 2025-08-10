import Util from '../../utils/Utils';
import CorePermissionsMappingService from '../services/CorePermissionsMappingService';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';

const util = new Util();

class CorePermissionMappingsController {
  static async getAllCorePermissionMappings(req, res) {
    let corePermissionMappings = [];
    corePermissionMappings = await CorePermissionsMappingService.getAllCorePermissionMappings(
      req.body,
    );
    if (corePermissionMappings.length > 0) {
      util.setSuccess(200, corePermissionMappings);
    } else {
      const err = ErrorCodes['100000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async createCorePermissionMappings(req, res) {
    const corePermission = await CorePermissionsMappingService.addCorePermissionsMapping(
      req.body, req,
    ).catch(() => {
      const err = ErrorCodes['100001'];
      throw new ApplicationError(err);
    });
    util.setSuccess(200, corePermission);
    return util.send(req, res);
  }

  static async deleteCorePermissionMappings(req, res) {
    const corePermission = await CorePermissionsMappingService.deleteCorePermissionsMapping(
      req,
    );
    if (corePermission) {
      util.setSuccess(200);
    } else {
      const err = ErrorCodes['100002'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async updateCorePermissionMappings(req, res) {
    const corePermissionMappings = await CorePermissionsMappingService.updateCorePermissionsMapping(
      req,
    );
    if (corePermissionMappings.message && corePermissionMappings.message === 'Validation error') {
      const err = ErrorCodes['100001'];
      throw new ApplicationError(err);
    } else {
      util.setSuccess(200, corePermissionMappings);
    }
    return util.send(req, res);
  }
}

export default CorePermissionMappingsController;
