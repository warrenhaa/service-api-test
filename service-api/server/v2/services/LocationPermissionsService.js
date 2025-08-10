import { Op, QueryTypes } from 'sequelize';
import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import Logger from '../../utils/Logger';
import checkAllDeviceAccess from '../helpers/CheckAllDeviceAccess';
import ROLES from '../../utils/constants/Roles';
import { DPCommands } from '../../utils/constants/DeviceProvisionCommands';
import UsersService from './UsersService';
import jobsService from './JobsService';

class LocationPermissionService {
  static async getAdminData(companyId) {
    const adminemail = process.env.ADMIN_EMAIL || 'nikhil.s@ctiotsolution.com';
    const password = process.env.ADMIN_PASSWORD || '5Gen@123';
    const AdminData = await UsersService.cognitoLogin({ body: { company_id: companyId } }, adminemail, password);
    return AdminData;
  }

  static async updateSharerListOnUserLocationUpdation(adminData, locationId, userid, command, companyId, requestid) {
    // get email of assigned user
    const user = await database.users.findOne({
      where: {
        company_id: companyId,
        id: userid,
      },
      attributes: ['email'],
    });
    if (!user) {
      Logger.error(`updateSharerListOnUserLocationUpdation Error email not found for ${userid}`);
      throw Error(JSON.stringify({ error: '400002' }));
    }
    const { email } = user;
    // get all device attached on locations and child locations;
    const queryDevicesList = 'SELECT d.* FROM devices d WHERE d.location_id IN ( SELECT id FROM locations WHERE id IN (:locationIds) OR path ? :locationIds )';
    let devicesList = [];
    devicesList = await database.sequelize.query(queryDevicesList,
      {
        raw: true,
        replacements: {
          locationIds: [locationId],
        },
        logging: console.log,
        model: database.devices,
      });
    // remove devices whose gateway present in the list as we donot need to share devices separately.
    const gatewayIdList = devicesList.map((d) => (d.type === 'gateway' && d.id)).filter((a) => a);
    devicesList = devicesList.map((d) => ((!d.gateway_id || !gatewayIdList.includes(d.gateway_id)) && d)).filter((a) => a);

    let lockUnlockCommand = -1;
    if (command === DPCommands.share) {
      lockUnlockCommand = DPCommands.lockUser;
    } else if (command === DPCommands.unshare) {
      lockUnlockCommand = DPCommands.unlockUser;
    } else {
      Logger.error(`updateSharerListOnUserLocationUpdation Error command not valid ${command} ${userid}`);
      throw Error(JSON.stringify({ error: '400002' }));
    }

    const metadata = { locationId, email, percentage: 0 };
    const input = {
      accessToken: adminData.accessToken,
      adminIdentityId: adminData.identityId,
      email,
      devicesList,
      command,
      lockUnlockCommand,
      metadata,
    };
    const job = await jobsService.createJob('userLocationAssignment', input, companyId, null, null, metadata, requestid)
      .then(async (resp) => resp)
      .catch((err) => {
        throw (err);
      });
    return job;
  }

  static async deleteLocationPermissions(req) {
    const userId = req.body.user_id;
    const companyId = req.body.company_id;
    const locationId = req.body.location_id;
    const toBeDeleted = await database.locations_permissions.findOne({
      where: {
        company_id: companyId,
        user_id: userId,
        location_id: locationId,
      },
    });
    const toBeDeleted_Locations = await database.locations.findOne({
      where: {
        company_id: companyId,
        id: locationId,
      },
    });
    const toBeDeleted_Users = await database.users.findOne({
      where: {
        company_id: companyId,
        id: userId,
      },
    });
    const adminData = await this.getAdminData(companyId);
    await this.updateSharerListOnUserLocationUpdation(adminData, locationId, userId, DPCommands.unshare, companyId, req.request_id);

    const queryStr = `DELETE FROM locations_permissions lp USING locations l WHERE l.id = lp.location_id 
                        AND lp.user_id= :userId AND lp.company_id= :companyId AND (lp.location_id= :locationId OR l.path ? :locationId)`;
    const isDeleted = database.sequelize.query(queryStr,
      {
        raw: true,
        replacements: { locationId, userId, companyId },
        /* eslint-disable no-console */
        logging: console.log,
        type: QueryTypes.DELETE,
      })
      .then(() => true)
      .catch((error) => {
        Logger.error(`Error in loc perms deletion with ${locationId} , ${error}`);
        throw Error(JSON.stringify({ error: '150008' }));
      });
    const location_obj = {
      old: toBeDeleted_Locations,
      new: {},
    };
    const user_obj = {
      old: toBeDeleted_Users,
      new: {},
    };
    if (toBeDeleted && toBeDeleted_Locations) {
      ActivityLogs.addActivityLog(Entities.locations.entity_name, Entities.locations.event_name.unassigned,
        user_obj, Entities.notes.event_name.deleted, toBeDeleted_Locations.id, companyId, userId, null);
    }
    if (toBeDeleted && toBeDeleted_Users) {
      ActivityLogs.addActivityLog(Entities.users.entity_name, Entities.users.event_name.unassigned,
        location_obj, Entities.notes.event_name.deleted, toBeDeleted_Users.id, companyId, userId, null);
    }
    return isDeleted;
  }

  static async addLocationPermissions(body, req) {
    const userId = body.user_id;
    const companyId = body.company_id;
    const locationPermissions = body.permissions.site_permissions;
    let userRole = body.role;
    const adminData = await this.getAdminData(companyId);
    locationPermissions.map(async (locId) => {
      const locationDetail = await database.locations.findOne({
        where: { id: locId },
        raw: true,
      });
      if (locationDetail) {
        await this.updateSharerListOnUserLocationUpdation(adminData,
          locId, userId, DPCommands.share, companyId, req.request_id);
      }
    })
    const location = await Promise.all(
      locationPermissions.map(async (key) => {
        const locationDetail = await database.locations.findOne({
          include: [
            {
              model: database.location_types,
              required: true,
              as: 'location_types',
            },
          ],
          where: {
            id: key,
          },
          raw: true,
        });
        if (locationDetail) {
          const locationType = locationDetail['location_types.name'];
          if (ROLES[locationType]) {
            userRole = ROLES[locationType];
          } else {
            userRole = null;
          }
          await database.locations_permissions.findOrCreate({
            where: {
              company_id: companyId,
              user_id: userId,
              location_id: key,
              role: userRole,
            },
            raw: true,
          }).then(async (result) => {
            const permission = result[0];
            const userDetail = await database.users.findOne({
              where: {
                id: permission.user_id,
              },
              raw: true,
            });
            const typeName = locationDetail['location_types.name'];

            const query = {};
            const locKey = `path.${permission.location_id}.${typeName}`;
            query[locKey] = locationDetail.name;
            const childLocations = await database.locations.findAll({ where: query, raw: true });
            await childLocations.forEach(async (locationNew) => {
              const hasPermission = await database.locations_permissions
                .findOne({
                  where: {
                    user_id: permission.user_id,
                    location_id: locationNew.id,
                  },
                  raw: true,
                }).catch((error) => {
                  throw error;
                });
              if (hasPermission) {
                await database.locations_permissions.destroy({
                  where: { id: hasPermission.id },
                });
              }
              await database.locations_permissions.create({
                location_id: locationNew.id,
                company_id: permission.company_id,
                user_id: permission.user_id,
                created_by: permission.user_id,
                updated_by: permission.user_id,
                role: userRole,
              }).catch((err) => {
                throw err;
              });
            });
            const created = result[1]; // boolean stating if it was created or not
            const location_obj = {
              old: {},
              new: locationDetail,
            };
            const user_obj = {
              old: {},
              new: userDetail,
            };
            if (userDetail) {
              ActivityLogs.addActivityLog(Entities.locations.entity_name, Entities.locations.event_name.assigned,
                user_obj, Entities.notes.event_name.added, locationDetail.id, companyId, userId, null);
            }
            if (locationDetail) {
              ActivityLogs.addActivityLog(Entities.users.entity_name, Entities.users.event_name.assigned,
                location_obj, Entities.notes.event_name.added, userDetail.id, companyId, userId, null);
            }
            return permission.dataValues;
          }).catch((err) => {
            throw err;
          });
        }
      }),
    );
    return location;
  }

  static async updateLocationPermissions(body) {
    const userId = body.user_id;
    const companyId = body.company_id;
    const userRole = body.role;
    const locationPermissions = body.permissions.site_permissions;

    await database.locations_permissions.destroy({
      where: {
        company_id: companyId,
        user_id: userId,
      },
    });
    const location = await Promise.all(
      locationPermissions.map(async (key) => {
        await database.locations_permissions.findOrCreate({
          where: {
            company_id: companyId,
            user_id: userId,
            location_id: key,
            role: userRole || null,
          },
        }).then(async (result) => {
          const permission = result[0]; // the instance of the author
          const locationDetail = await database.locations.findOne({
            include: [
              {
                model: database.location_types,
                required: true,
                as: 'location_types',
              },
            ],
            where: { id: permission.location_id },
            raw: true,
          });
          const afterUser = await database.users.findOne({
            where: { id: permission.user_id },
            raw: true,
          });
          const typeName = locationDetail['location_types.name'];
          const query = {};
          const locKey = `path.${permission.location_id}.${typeName}`;
          query[locKey] = locationDetail.name;
          const childLocations = await database.locations.findAll({ where: query, raw: true });
          if (childLocations && childLocations.length > 0) {
            childLocations.forEach(async (locationNew) => {
              console.info('>>>>>>>>>>>>>>>', locationNew);
              const hasPermission = await database.locations_permissions
                .findOne({
                  where: {
                    user_id: permission.user_id,
                    location_id: locationNew.id,
                  },
                });
              if (hasPermission) {
                await database.locations_permissions.destroy({
                  where: { id: hasPermission.id },
                });
              }
              await database.locations_permissions.create({
                location_id: locationNew.id,
                company_id: permission.company_id,
                user_id: permission.user_id,
                created_by: permission.user_id,
                updated_by: permission.user_id,
                role: userRole || null,
              }).catch((err) => {
                throw err;
              });
            });
          }
          const created = result[1]; // boolean stating if it was created or not
          const user_obj = {
            old: {},
            new: afterUser,
          };
          const location_obj = {
            old: {},
            new: locationDetail,
          };
          if (afterUser) {
            ActivityLogs.addActivityLog(Entities.locations.entity_name, Entities.locations.event_name.assigned,
              user_obj, Entities.notes.event_name.updated, afterUser.id, companyId, userId, null);
          }
          if (locationDetail) {
            ActivityLogs.addActivityLog(Entities.users.entity_name, Entities.users.event_name.assigned,
              location_obj, Entities.notes.event_name.updated, locationDetail.id, companyId, userId, null);
          }
          return permission.dataValues;
        }).catch((err) => {
          console.info('updateLocationPermissions', err);
        });
      }),
    );
    return location;
  }

  static async removeSuperAdminUsersOfLocation(list, companyId) {
    return new Promise(async (resolve, reject) => {
      const userlist = [];
      const adminlist = [];
      list.forEach(async (element) => {
        const userId = element.user_id || element.id;
        const isAdmin = await checkAllDeviceAccess({ companyId, userId });
        if (!isAdmin) {
          userlist.push(element);
        } else {
          adminlist.push(element);
        }
        if ((userlist.length + adminlist.length) == (list.length)) {
          resolve(userlist);
        }
      });
    });
  }

  static async getUsersOfLocation(req) {
    const query = {};
    query.company_id = req.company_id;
    query.location_id = req.query.location_id;
    const location = await database.locations
      .findOne({
        where: { company_id: req.company_id, id: req.query.location_id },
        include: [
          {
            model: database.location_types,
            required: true,
            as: 'location_types',
          },
        ],
      });
    if (!location) {
      throw Error(JSON.stringify({ error: '500002' }));
    }
    query.role = ROLES[location.location_types.name];

    const USERSQUERY = `select distinct u.* from users u inner join locations_permissions lp on lp.user_id = u.id
      where lp.location_id = :location_id and lp.role = :role and u.company_id = :company_id`;

    let userList = await database.sequelize.query(USERSQUERY,
      {
        raw: true,
        replacements: {
          role: query.role,
          company_id: req.company_id,
          location_id: location.id,
        },
        logging: console.log,
        model: database.users,
      });
    userList = userList.map((u) => { u.user_id = u.id; return u; });
    if (userList.length > 0) {
      userList = await this.removeSuperAdminUsersOfLocation(userList, req.company_id);
    }
    return userList;
  }

  static async getNonUsersOfLocation(req) {
    const query = {};
    query.company_id = req.company_id;
    query.location_id = req.query.location_id;
    const location = await database.locations
      .findOne({ where: { company_id: req.company_id, id: req.query.location_id } });
    if (!location) {
      throw Error(JSON.stringify({ error: '500002' }));
    }
    let allUsers = null;
    if (!await checkAllDeviceAccess({ companyId: req.company_id, userId: req.user_id })) {
      const queryStr = `select distinct usr.* from users usr 
      where (usr.id in ( select distinct u.id from users u inner join locations_permissions lp on lp.user_id = u.id
       inner join locations_permissions loc on loc.location_id = lp.location_id 
       inner join locations_permissions loc1 on loc1.location_id = loc.location_id
         and loc.user_id=:user_id
         and loc.location_id!=:location_id)
     or usr.invite_id in (select uin.id from user_invitations uin where  uin.created_by= :created_by))
       and usr.company_id = :company_id
     and usr.id not in (select distinct loc2.user_id from locations_permissions loc2
                               where loc2.location_id = :location_id)
     and usr.id != :user_id `;
      const nonLocUsers = await database.sequelize.query(queryStr,
        {
          raw: true,
          replacements: {
            user_id: req.user_id,
            company_id: req.company_id,
            location_id: req.query.location_id,
            created_by: req.userDetails.email,
          },
          logging: console.log,
          model: database.users,
        });
      allUsers = [...nonLocUsers];
    } else {
      const locationUsers = await database.locations_permissions
        .findAll({
          where: query,
          attributes: ['user_id'],
          raw: true,
        });
      let users = locationUsers.map((result) => result.user_id);
      users = [...users, req.user_id];
      allUsers = await database.users
        .findAll({
          where: {
            id: {
              [Op.notIn]: users,
            },
          },
          raw: true,
        });
    }
    let usersData = allUsers.map((user) => {
      const userInfo = { ...user };
      userInfo.user_id = user.id;
      delete userInfo.id;
      return userInfo;
    });
    if (usersData.length > 0) {
      usersData = await this.removeSuperAdminUsersOfLocation(usersData, req.company_id);
    }
    return usersData;
  }
}

export default LocationPermissionService;
