import database from '../../models';
import checkAllDevicesAccess from '../helpers/CheckAllDeviceAccess';
import jobsService from './JobsService';
import UsersService from './UsersService';

class FixExistingUserService {
  static async filterUsersOnType(list, companyId, type) {
    return new Promise(async (resolve, reject) => {
      const userlist = [];
      const adminlist = [];
      list.forEach(async (element) => {
        const userId = element.id;
        let isAdmin = await checkAllDevicesAccess({ companyId, userId });
        if (!isAdmin) {
          userlist.push(element);
        } else {
          adminlist.push(element);
        }
        if ((userlist.length + adminlist.length) == (list.length)) {
          if (type === 'superadmin') {
            resolve(adminlist);
          } else {
            resolve(userlist);
          }
        }
      });
    });
  }
  static async getAllUsers() {
    let users = await database.users.findAll();
    return users;
  }

  static async getSuperAdmins(req) {
    let users = await database.users.findAll({ raw: true });
    users = await this.filterUsersOnType(users, req.company_id, 'superadmin');
    return users;
  }

  static async getLocationManagers(req) {
    let users = await database.users.findAll({ raw: true });
    users = await this.filterUsersOnType(users, req.company_id, 'locationmanager');
    return users;
  }

  static async updateDeviceControlPermission(req) {
    const corePermissionMappings = await database.core_permissions_mappings.findOne({
      where: {
        name: 'devices',
        company_id: req.company_id
      },
      raw: true
    });
    let userToUpdate = req?.body?.email;
    let users = await database.users.findAll({ raw: true });
    const successList = [];
    const failedList = [];
    const noupdateList = [];
    for (let user of users) {
      const controlAccess = await database.core_permissions.findOne({
        where: {
          user_id: user.id,
          core_permission_mapping_id: corePermissionMappings.id,
          access_level: 'control'
        },
        raw: true
      })
      if (!controlAccess && (!userToUpdate || user.email === userToUpdate)) {
        try {
          const newControlAccess = await database.core_permissions.create({
            company_id: req.company_id,
            core_permission_mapping_id: corePermissionMappings.id,
            access_level: 'control',
            user_id: user.id,
            created_by: user.id,
            updated_by: user.id,
          })
          if (newControlAccess) {
            successList.push(user);
          }
        } catch (error) {
          failedList.push({ user, errorMsg: error.message });
        }
      }
      else {
        noupdateList.push(user)
      }
    }
    return { totalCount: users.length, successList, failedList, noupdateList }
  }

  static async shareDeviceExistingLocationManager(req) {
    const adminemail = process.env.ADMIN_EMAIL || 'nikhil.s@ctiotsolution.com';
    const password = process.env.ADMIN_PASSWORD || '5Gen@123';
    const adminData = await UsersService.cognitoLogin({ body: { company_id: req.company_id } }, adminemail, password);
    let userToUpdate = req?.body?.email;
    let usersList = await this.getLocationManagers(req);
    if (userToUpdate) {
      usersList = usersList.filter(element => element.email === userToUpdate);
    }
    let metadata = {};
    const input = {
      accessToken: adminData.accessToken,
      adminIdentityId: adminData.identityId,
      command: 3,
      lockUnlockCommand: 23,
      usersList,
      metadata
    };
    const job = await jobsService.createJob('shareDeviceExistingLocationManager', input, req.company_id, null, null, metadata, req.request_id)
      .then(async (resp) => resp)
      .catch((err) => {
        throw (err);
      });
    const jobobj = { job };
    return jobobj;
  }

}

export default FixExistingUserService;