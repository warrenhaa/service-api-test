import Util from '../../utils/Utils';
import AccessPermissionService from '../services/AccessPermissionService';
import database from '../../models';
import { setInCache } from '../../cache/Cache';
import CacheKeys from '../../cache/Constants';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';
import LocationPermissionService from '../services/LocationPermissionsService';

const util = new Util();

class AccessPermissionController {
  static async getAccessPermissions(req, res) {
    let accessPermision = null;
    if (!accessPermision) {
      accessPermision = await AccessPermissionService.getAccessPermissions(req);
    }
    if (accessPermision) {
      util.setSuccess(200, accessPermision);
    } else {
      const err = ErrorCodes['700000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async createAccessPermissionFromInvite(req, res) {
    const id = req.body.user_id;
    const inviteDetails = await database.user_invitations.findOne({
      include: [
        {
          model: database.users,
          where: { id },
          required: true,
        },
      ],
    });
    if (!inviteDetails) {
      const err = ErrorCodes['700001'];
      throw new ApplicationError(err);
    }
    const permission = {};
    permission.permissions = inviteDetails.dataValues.initial_permissions;
    const body = Object.assign(req.body, permission);
    body.user_id = id;
    const userId = body.user_id;
    body.created_by = body.user_id;
    body.updated_by = id;
    const accessPermission = await AccessPermissionService.addAccessPermissions(
      body, req,
    ).catch((error) => {
      console.info('>>>>>>>>>>>', error);
      const err = ErrorCodes['700004'];
      throw new ApplicationError(err);
    });
    await setInCache(CacheKeys.ACCESS_PERMISSIONS, userId, accessPermission);
    util.setSuccess(200, accessPermission);
    return util.send(req, res);
  }

  static async createAccessPermission(req, res) {
    const { body } = req;
    body.created_by = req.user_id;
    body.updated_by = req.user_id;
    const accessPermission = await AccessPermissionService.addAccessPermissions(
      body, req,
    ).catch(() => {
      const err = ErrorCodes['700002'];
      throw new ApplicationError(err);
    });
    util.setSuccess(200, accessPermission);
    await setInCache(
      CacheKeys.ACCESS_PERMISSIONS,
      req.body.user_id,
      accessPermission,
    );
    return util.send(req, res);
  }

  static async getAllLocationsOfUser(req, res) {
    let locations = [];
    if (locations && locations.length <= 0) {
      locations = await AccessPermissionService.getAllLocationsOfUser(req);
    }
    if (locations && locations.length > 0) {
      util.setSuccess(200, locations);
    } else {
      const err = ErrorCodes['700003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async updateUserPermissions(req, res) {
    const permission = await AccessPermissionService.updateAccessPermissions(req);
    util.setSuccess(200, permission);
    if (permission) {
      util.setSuccess(200, permission);
    } else {
      const err = ErrorCodes['700000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async deleteLocationPermissions(req, res) {
    const isDeleted = await LocationPermissionService.deleteLocationPermissions(req)
      .catch((err) => {
        if (err.name && (err.name === 'SequelizeForeignKeyConstraintError' || err.name === 'SequelizeDatabaseError')) {
          const errorCode = ErrorCodes['800006'];
          throw new ApplicationError(errorCode);
        }
        const { error } = JSON.parse(err.message);
        const errorCode = ErrorCodes[error];
        throw new ApplicationError(errorCode);
      });
    if (isDeleted) {
      util.setSuccess(200, isDeleted);
    } else {
      const err = ErrorCodes['150006'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }
}

export default AccessPermissionController;
