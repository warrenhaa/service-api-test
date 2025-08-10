import Util from '../../utils/Utils';
import CorePermissionService from '../services/CorePermissionService';
import {
  getAllFromCache,
  setInCache,
  getOneFromCache,
  deleteFromCache,
} from '../../cache/Cache';
import CacheKeys from '../../cache/Constants';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';

const util = new Util();

class CorePermissionController {
  static async getAllCorePermissions(req, res) {
    let corePermissions = [];
    corePermissions = await getAllFromCache(CacheKeys.CORE_PERMISSIONS);
    corePermissions = await CorePermissionService.getAllCorePermissions(req);
    if (corePermissions.length > 0) {
      util.setSuccess(200, corePermissions);
    } else {
      const err = ErrorCodes['300000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async createCorePermission(req, res) {
    const body = { ...req.body };
    body.created_by = req.user_id;
    body.updated_by = req.user_id;
    const corePermission = await CorePermissionService.addCorePermissions(
      body,
    ).catch(() => {
      const err = ErrorCodes['300001'];
      throw new ApplicationError(err);
    });
    setInCache(CacheKeys.CORE_PERMISSIONS, req.user_id, corePermission);
    util.setSuccess(200, corePermission);
    return util.send(req, res);
  }

  static async getACorePermission(req, res) {
    let corePermission = [];
    corePermission = await getOneFromCache(
      CacheKeys.CORE_PERMISSIONS,
      req.params.id,
    );
    if (!corePermission) {
      corePermission = await CorePermissionService.getACorePermission(req);
    }
    if (corePermission) {
      util.setSuccess(200, corePermission);
    } else {
      const err = ErrorCodes['300002'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getCorePermissionsOfUser(req, res) {
    const corePermissionOfUser = await CorePermissionService.getCorePermissionsOfUser(
      req,
    );
    if (corePermissionOfUser.length > 0) {
      util.setSuccess(200, corePermissionOfUser);
    } else {
      const err = ErrorCodes['300003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async deleteACorePermission(req, res) {
    let corePermission = [];
    corePermission = await CorePermissionService.deleteACorePermission(req, req.params.id);
    if (corePermission) {
      corePermission = await deleteFromCache(
        CacheKeys.CORE_PERMISSIONS,
        req.params.id,
      );
      util.setSuccess(200);
    } else {
      const err = ErrorCodes['300004'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }
}

export default CorePermissionController;
