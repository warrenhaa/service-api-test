import UsersService from '../services/UsersService';
import Util from '../../utils/Utils';
import InvitationService from '../services/InvitationService';
import ApplicationError from '../../errors/ApplicationError';
import ErrorCodes from '../../errors/ErrorCodes';
import AccessPermissionController from './AccessPermissionController';
import UserInvitationStatus from '../../utils/constants/UserInvitationStatus';
const constantFromConfigs = require('../../cache/constantFromConfigs')
const util = new Util();

class UserController {
  static async getUserFromCognitoId(req, res) {
    const users = await UsersService.getUserFromCognitoId(req);
    if (users) {
      util.setSuccess(200, users);
    } else {
      const err = ErrorCodes['900001'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async login(req, res) {
    const { email, password, company_id } = req.body;
    const users = await UsersService.login(email, password, company_id)
      .catch((err) => {
        throw new ApplicationError(err);
      });
    if (users) {
      util.setSuccess(200, users);
    } else {
      const err = ErrorCodes['900001'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getAllUsersOfACompany(req, res) {
    const users = await UsersService.getAllUsersOfACompany(req);
    util.setSuccess(200, users);
    return util.send(req, res);
  }

  static async getAllCompaniesOfAUserFromCognitoId(req, res) {
    const users = await UsersService.getAllCompaniesOfAUserFromCognitoId(req);
    util.setSuccess(200, users);
    return util.send(req, res);
  }

  static async updateUserAttributes(req, res) {
    // condition to check loggedin user can delete current user.
    const userList = await UsersService.getAllUsersOfACompany(req);
    const candeleteUser = userList.users.find((u) => u.email == req.body.email);
    if (!candeleteUser && req.body.email !== req.userDetails.email) {
      const err = ErrorCodes['320005'];
      throw new ApplicationError(err);
    }
    const users = await UsersService.updateUserAttributes(req);
    if (users) {
      util.setSuccess(200, users);
    } else {
      const err = ErrorCodes['900005'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async createUser(req, res) {
    const invitations = await InvitationService.getInvite(req.body.invite_id);
    if (!invitations) {
      const err = ErrorCodes['900003'];
      throw new ApplicationError(err);
    } else if (invitations.status !== UserInvitationStatus.EXPIRED && invitations.status !== UserInvitationStatus.CONFIRMED) {
      req.body.company_id = invitations.company_id;
      const user = await UsersService.addUser(req.body, invitations, req.source_IP).then(async (userInfo) => {
        req.body = { ...userInfo.dataValues };
        req.body.user_id = userInfo.id;
        req.body.created_by = userInfo.id;
        await InvitationService.confirmInvite(req.body.invite_id, userInfo.id, req.body.company_id, req);
        await AccessPermissionController.createAccessPermissionFromInvite(req).catch((err) => {
        });
        return userInfo;
      }).catch((err) => {
        throw new ApplicationError(err);
      });
      util.setSuccess(200, user);
    } else {
      const err = ErrorCodes['900003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async createAdminUser(req, res) {
    req.body.company_id = req.company_id;
    const user = await UsersService.addAdminUser(req.body, null, req.source_IP)
      .then(async (userInfo) => {
        req.body = { ...userInfo.dataValues };
        req.body.user_id = userInfo.id;
        req.body.created_by = userInfo.id;
        req.user_id = userInfo.id
        let constants = await constantFromConfigs.data('constants');
        if (constants.DefaultAdminPermissions) {
          req.body.permissions = constants.DefaultAdminPermissions
          await AccessPermissionController.createAccessPermission(req).catch((err) => {
            console.log("🚀 ~ UserController ~ user ~ err:", err)
          });
        }
        return userInfo;
      }).catch((err) => {
        throw new ApplicationError(err);
      });
    util.setSuccess(200, user);
    return util.send(req, res);
  }

  static async deleteUser(req, res) {
    // condition to check loggedin user can delete current user.
    const userList = await UsersService.getAllUsersOfACompany(req);
    const candeleteUser = userList.users.find((u) => u.id == req.params.id);
    if (!candeleteUser) {
      const err = ErrorCodes['320005'];
      throw new ApplicationError(err);
    }
    const userToDelete = await UsersService.deleteUser(req);
    if (userToDelete) {
      util.setSuccess(200, userToDelete);
    } else {
      const err = ErrorCodes['900004'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getUsersOfLocation(req, res) {
    const permission = await UsersService.getUsersOfLocation(req);
    if (permission && !permission.message) {
      util.setSuccess(200, permission);
    } else {
      const err = ErrorCodes['500002'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getNonUsersOfLocation(req, res) {
    const permission = await UsersService.getNonUsersOfLocation(req);
    util.setSuccess(200, permission);
    if (permission && !permission.message) {
      util.setSuccess(200, permission);
    } else {
      const err = ErrorCodes['500002'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getUsersLocation(req, res) {
    const usersLocation = await UsersService.getUsersLocation(req);
    if (usersLocation && !usersLocation.message) {
      util.setSuccess(200, usersLocation);
    } else {
      const err = ErrorCodes['900004'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async updateAdminStatus(req, res) {
    const updateStatus = await UsersService.updateAdminStatus(req);
    util.setSuccess(200, updateStatus);
    return util.send(req, res);
  }

  static async getDataTablePreferences(req, res) {
    const dtPreferences = await UsersService.getDataTablePreferences(req);
    if (dtPreferences && !dtPreferences.message) {
      util.setSuccess(200, dtPreferences);
    } else {
      const err = ErrorCodes['170002'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async createDataTablePreferences(req, res) {
    const dtPreferences = await UsersService.createDataTablePreferences(req);
    if (dtPreferences && !dtPreferences.message) {
      util.setSuccess(200, dtPreferences);
    } else {
      const err = ErrorCodes['170003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async deleteDataTablePreferences(req, res) {
    const dtPreferences = await UsersService.deleteDataTablePreferences(req);
    if (dtPreferences && !dtPreferences.message) {
      util.setSuccess(200, dtPreferences);
    } else {
      const err = ErrorCodes['170003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }
}

export default UserController;
