import { Op, QueryTypes } from 'sequelize';
import lodash from 'lodash';
import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import paginate from '../../utils/Paginate';
import jobsService from './JobsService';
import { getAWSDetailsFromCompanyId, createAWSCredentialPath } from '../helpers/AwsCredentials';
import LocationPermissionsService from './LocationPermissionsService';
import AccessPermissionService from './AccessPermissionService';
import checkAllDeviceAccess from '../helpers/CheckAllDeviceAccess';
import Logger from '../../utils/Logger';
import ErrorCodes from '../../errors/ErrorCodes';
import ROLES from '../../utils/constants/Roles';
import { DPCommands } from '../../utils/constants/DeviceProvisionCommands';
import Responses from '../../utils/constants/Responses';
import DeviceProvisionService from './DeviceProvisionService';
import { getCompany } from '../../cache/Companies';
import UserInvitationStatus from '../../utils/constants/UserInvitationStatus';
import { getOneFromCacheByKey, setInCacheByKey } from '../../cache/Cache';
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const AWS = require('aws-sdk');

class UsersService {
  static async cognitoLogin(req, email, password) {
    return new Promise(async (resolve, reject) => {
      const companyId = req.body.company_id;
      const AwsConstants = await getAWSDetailsFromCompanyId(companyId);
      AWS.config.update({
        region: AwsConstants.aws_region,
        accessKeyId: AwsConstants.aws_iam_access_key,
        secretAccessKey: AwsConstants.aws_iam_access_secret,
      });
      const poolData = {
        UserPoolId: AwsConstants.userPoolId, // Your user pool id here
        ClientId: AwsConstants.aws_cognito_userpool_web_client_id, // Your client id here
      };

      const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

      try {
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
          Username: email,
          Password: password,
        });
        const userData = {
          Username: email,
          Pool: poolData,
          Pool: userPool,
        };
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
          async onSuccess(result) {
            const accessToken = result.getAccessToken().getJwtToken();
            const idToken = result.getIdToken().getJwtToken();
            const getId = function (idToken1) {
              return new Promise((resolve1, reject1) => {
                const params = {
                  IdentityPoolId: AwsConstants.aws_cognito_identity_pool,
                  AccountId: process.env.ACCOUNT_ID,
                  Logins: {},
                };
                params.Logins['cognito-idp.' + AwsConstants.aws_region + '.amazonaws.com/' + AwsConstants.userPoolId] = idToken1
                new AWS.CognitoIdentity().getId(params, (err, data) => {
                  if (err) {
                    console.log(err, err.stack);
                    reject1(err);
                  } else {
                    resolve1(data);
                  }
                });
              });
            };
            await getId(idToken)
              .then(async (result2) => {
                const { sub } = result.idToken.payload;
                const identityId = result2.IdentityId;

                resolve({
                  accessToken, identityId, // returning access token and identity id
                });
              })
              .catch((err) => {
                console.log(err);
                reject(err);
              });
          },
          onFailure(err) {
            console.log(err);
            reject(err);
          },

        });
      } catch (error) {
        console.log(error);
      }
    });
  }

  static async login(email, password, company_id) {
    return new Promise(async (resolve, reject) => {
      const AwsConstants = await getAWSDetailsFromCompanyId(company_id);
      AWS.config.update({
        region: AwsConstants.aws_region,
        accessKeyId: AwsConstants.aws_iam_access_key,
        secretAccessKey: AwsConstants.aws_iam_access_secret
      });
      const poolData = {
        UserPoolId: AwsConstants.userPoolId, // Your user pool id here    
        ClientId: AwsConstants.aws_cognito_userpool_web_client_id // Your client id here
      };
      const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
      var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password,
      });
      var userData = {
        Username: email,
        Pool: poolData,
        Pool: userPool
      };
      var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async function (result) {
          var obj = {
            access_token: result.getAccessToken().getJwtToken(),
            id_token: result.getIdToken().getJwtToken(),
            refresh_token: result.getRefreshToken().getToken()
          }
          resolve(obj)
        },
        onFailure: function (error) {
          const err = ErrorCodes['900007'];
          reject(err)
        },

      });
    })
  }

  static async checkTokenListInCache(email, token) {
    const cacheKey = "jwt_reset_password:"+email;
    let hasResetPasswordFalg = false

    const jwtExpired = process.env.JWT_EXPIRED;
    if (jwtExpired) {
      console.log("🚀  file: OccupantRegisterService.js:100 ~ cacheKey:", cacheKey)
      await getOneFromCacheByKey(cacheKey)
        .then(async (result) => {
          console.log("🚀  file: OccupantRegisterService.js:100 ~ result:", result)
          if (result != null) {
            hasResetPasswordFalg = true
          }
        });
    }

    return hasResetPasswordFalg
  }

  static async getUserFromCognitoId(req) {
    const users = await database.users.findOne({
      where: {
        cognito_id: req.query.cognito_id,
        company_id: req.body.company_id,
      },
      raw: true,
    });
    if (!users) {
      return null;
    }
    return new Promise((resolve) => {
      createAWSCredentialPath(req.body.company_id).then((value) => {
        AWS.config.loadFromPath(value);
        const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
        const params = {
          AccessToken: req.headers['x-access-token'], /* required */
        };
        cognitoidentityserviceprovider.getUser(params, (err, data) => {
          if (err) {
            resolve(null);
          } else {
            const mapped = data.UserAttributes.map((item) => ({ [item.Name]: item.Value }));
            const formattedData = Object.assign({}, ...mapped);
            const userDetail = { ...users, ...formattedData };
            resolve(userDetail);
          }
        });
      });
    });
  }

  static async getUserIdFromCognitoId(cognito_id, company_id) {
    const user = await database.users.findOne({
      where: {
        cognito_id,
        // company_id,
      },
    });
    return user;
  }

  static async getAllUSersFromCognito(req) {
    let allUsers = [];
    try {
      let more = true;
      let paginationToken = '';
      const companyId = req.body.company_id;
      const awsDetails = await getAWSDetailsFromCompanyId(companyId);

      while (more) {
        const params = {
          UserPoolId: `${awsDetails.userPoolId}`,
        };
        if (paginationToken !== '') {
          params.PaginationToken = paginationToken;
        }
        // eslint-disable-next-line no-await-in-loop
        const rawUsers = await this.listUsers(req, params);
        allUsers = allUsers.concat(rawUsers.Users);
        if (rawUsers.PaginationToken) {
          paginationToken = rawUsers.PaginationToken;
        } else {
          more = false;
        }
      }
    } catch (error) {
      Logger.error('getAllUSersFromCognito', error);
    }
    return allUsers;
  }

  static async listUsers(req, params) {
    return new Promise((resolve, reject) => {
      createAWSCredentialPath(req.body.company_id).then((value) => {
        AWS.config.loadFromPath(value);
        const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
        cognitoidentityserviceprovider.listUsers(params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    });
  }

  static async getAllCompaniesOfAUserFromCognitoId(req) {
    const users = await database.users.findAll({
      where: {
        cognito_id: req.query.cognito_id,
      },
      include: [
        {
          model: database.companies,
          required: false,
          as: 'company',
        },
      ],
    });
    return users;
  }

  static updateUserInfo(obj, cognito_id, company_id) {
    return new Promise((resolve, reject) => {
      database.users.update(obj, {
        where: {
          cognito_id, company_id,
        },
      }).then((result) => {
        resolve();
      }).catch((err) => {
        reject();
      });
    });
  }

  static async getAllUsersOfACompany(req) {
    const params = req.query;
    const page = params.page || null;
    const pageSize = params.pageSize || null;
    const startDate = params.startDate || null;
    const endDate = params.endDate || null;
    const company = {};
    company.company_id = req.body.company_id;
    const query = { ...params, ...company };
    if (startDate && endDate) {
      query.event_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
    delete query.page;
    delete query.pageSize;
    delete query.startDate;
    delete query.endDate;
    query.id = {
      [Op.not]: req.user_id,
    };
    let users = {};
    /*  condition to check if loggedin user has all device visibility
    if no then add condition for getting only those users which are
    assigned to loggedin user's locations. */
    if (!await checkAllDeviceAccess({ companyId: company.company_id, userId: req.user_id })) {
      const loggedInUserLocationsPermission = await database.locations_permissions.findAll({
        where: {
          user_id: req.user_id,
          company_id: company.company_id,
        },
        raw: true,
      });
      const locationArr = loggedInUserLocationsPermission.map((obj) => obj.location_id);
      const LOCATIONUSERSQUERY = `SELECT DISTINCT lp.* FROM locations_permissions lp
        INNER JOIN users u ON u.id=lp.user_id
        INNER JOIN user_invitations ui ON ui.id = u.invite_id AND ui.created_by != :created_by
        WHERE ${locationArr.length > 0 ? 'lp.location_id IN (:locationArr) AND' : ''}  lp.company_id =:company_id`;
      const locationUserList = await database.sequelize.query(
        LOCATIONUSERSQUERY,
        {
          raw: true,
          replacements: {
            locationArr,
            created_by: req.userDetails.email,
            offset: page * pageSize,
            limit: pageSize,
            company_id: company.company_id,
          },
          logging: console.log,
          model: database.locations_permissions,
        },
      );
      const locationUserIdList = locationUserList.map((locUser) => {
        const expectedLocRole = loggedInUserLocationsPermission.find((obj) => obj.location_id == locUser.location_id);
        if (expectedLocRole?.role === ROLES.site
          || (expectedLocRole?.role && locUser?.role && expectedLocRole?.role === locUser?.role)) {
          return locUser.user_id;
        }
      }).filter((a) => a);

      const USERSQUERY = `SELECT DISTINCT u.* FROM users u
        INNER JOIN user_invitations ui ON ui.id = u.invite_id
        WHERE ( ${locationUserIdList.length > 0 ? 'u.id IN (:useridList) or' : ''} ui.created_by = :created_by) AND u.id != :user_id`;

      const userList = await database.sequelize.query(
        USERSQUERY,
        {
          raw: true,
          replacements: {
            useridList: locationUserIdList,
            created_by: req.userDetails.email,
            user_id: req.user_id,
          },
          logging: console.log,
          model: database.users,
        },
      );
      users.count = userList.length;
      users.rows = userList;
    } else {
      users = await database.users.findAndCountAll(
        paginate(
          {
            where: query,
            raw: true,
          },
          { page, pageSize },
        ),
      );
    }
    const data = {};
    data.count = users.count;
    data.users = users.rows.map((u) => { u.user_id = u.id; return u; });
    return data;
  }

  static async getUserCredentials(filter, companyId) {
    return new Promise(async (resolve, reject) => {
      // get company data from cache if not present set
      const company = await getCompany(companyId).then(result => {
        return (result);
      }).catch((error) => {
        reject(error);
      });
      if (!company) {
        const err = ErrorCodes['000001'];
        reject(err);
      }
      const companyCreds = company;
      AWS.config.update({
        region: companyCreds.aws_region,
        accessKeyId: companyCreds.aws_iam_access_key,
        secretAccessKey: companyCreds.aws_iam_access_secret,
      });
      const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
      const params = {
        UserPoolId: companyCreds.aws_cognito_user_pool,
        Filter: filter,
      };
      cognitoidentityserviceprovider.listUsers(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Users);
        }// successful response
      });
    });
  }

  static async getUserGroups(email, companyId) {
    return new Promise(async (resolve, reject) => {
      // get company data from cache if not present set
      const company = await getCompany(companyId).then(result => {
        return (result);
      }).catch((error) => {
        reject(error);
      });
      if (!company) {
        const err = ErrorCodes['000001'];
        reject(err);
      }
      const companyCreds = company;
      AWS.config.update({
        region: companyCreds.aws_region,
        accessKeyId: companyCreds.aws_iam_access_key,
        secretAccessKey: companyCreds.aws_iam_access_secret,
      });
      const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
      const params = {
        UserPoolId: companyCreds.aws_cognito_user_pool,
        Username: email, // The user to retrieve
      };
      cognitoidentityserviceprovider.adminListGroupsForUser(params, (err, data) => {
        if (err) {
          console.error("Error:", err);
          reject(err);
        }
        else {
          resolve(data.Groups);
        }
      });


    });
  }

  static async addAdminUser(body, source_IP) {
    const filter = `sub = "${body.cognito_id}"`;
    const userDetails = await this.getUserCredentials(filter, body.company_id).catch((err) => { throw err; });
    let phoneNumber = null;
    let name = null;
    let email = null;
    if (userDetails && userDetails.length > 0) {
      const emailObj = lodash.filter(userDetails[0].Attributes, [
        'Name',
        'email',
      ]);
      const nameObj = lodash.filter(userDetails[0].Attributes, [
        'Name',
        'name',
      ]);
      const phoneNumberObj = lodash.filter(userDetails[0].Attributes, [
        'Name',
        'phone_number',
      ]);

      if (emailObj.length > 0) {
        email = emailObj[0].Value;
      }
      if (phoneNumberObj.length > 0) {
        phoneNumber = phoneNumberObj[0].Value;
      }
      if (nameObj.length > 0) {
        name = nameObj[0].Value;
      }
      const userExists = await database.users.findOne({
        where: {
          email
        }
      }).catch(error => {
        const err = ErrorCodes['900000'];
        throw err;
      })
      if (userExists) {
        const err = ErrorCodes['900000'];
        throw err;
      }

      const userGroups = await this.getUserGroups(email, body.company_id).catch((err) => { throw err; });
      if (userGroups && userGroups.length > 0) {
        let adminGroup = userGroups.filter(element => element.GroupName == 'Admin-Salus')
        if (!(adminGroup && adminGroup.length > 0)) {
          const err = ErrorCodes['900013'];
          throw err;
        } else {
          const adminUser = await this.getUserByEmail(process.env.ADMIN_EMAIL).catch(err => {
            throw err
          });
          const Day = process.env.USER_EXPIRE_AFTER_DAYS;
          const expiryDate = new Date(Date.now() + Day * 24 * 60 * 60 * 1000);
          const invite = await database.user_invitations.create({
            email: email,
            created_by: adminUser.email,
            updated_by: adminUser.email,
            status: UserInvitationStatus.CONFIRMED,
            expires_at: expiryDate,
            initial_permissions: {},
            company_id: body.company_id,
          }).catch((err) => {
            throw (err);
          });

          const user = await database.users.create({
            cognito_id: body.cognito_id,
            company_id: body.company_id,
            invite_id: invite.id,
            email,
            phone_number: phoneNumber,
            name,
            identity_id: body.identity_id || null,
          }).catch((error) => {
            const err = ErrorCodes['900000'];
            throw err;
          });
          const obj = {
            old: {},
            new: user,
          };
          ActivityLogs.addActivityLog(Entities.users.entity_name, Entities.users.event_name.added,
            obj, Entities.notes.event_name.added, user.id, body.company_id, user.id, null, null, source_IP)
          return user;
        }
      } else {
        const err = ErrorCodes['900013'];
        throw err;
      }
    } else {
      const err = ErrorCodes['900001'];
      throw err;
    }
  }

  static async addUser(body, invitation) {
    const filter = `sub = "${body.cognito_id}"`;
    const userDetails = await this.getUserCredentials(filter, body.company_id).catch((err) => { throw err; });
    let phoneNumber = null;
    let name = null;
    let email = null;
    if (userDetails && userDetails.length > 0) {
      const emailObj = lodash.filter(userDetails[0].Attributes, [
        'Name',
        'email',
      ]);
      const nameObj = lodash.filter(userDetails[0].Attributes, [
        'Name',
        'name',
      ]);
      const phoneNumberObj = lodash.filter(userDetails[0].Attributes, [
        'Name',
        'phone_number',
      ]);

      if (emailObj.length > 0) {
        email = emailObj[0].Value;
      }
      if (phoneNumberObj.length > 0) {
        phoneNumber = phoneNumberObj[0].Value;
      }
      if (nameObj.length > 0) {
        name = nameObj[0].Value;
      }
      const inviterUserObj = await this.getUserByEmail(invitation.created_by).catch((err) => { throw err; });
      const user = await database.users.create({
        cognito_id: body.cognito_id,
        invite_id: body.invite_id,
        company_id: body.company_id,
        email,
        phone_number: phoneNumber,
        name,
        identity_id: body.identity_id || null,
      }).catch((error) => {
        const err = ErrorCodes['900000'];
        throw err;
      });
      if (inviterUserObj) {
        const InviterObj = {
          inviteeEmail: email,
          inviterEmail: invitation.created_by,
          receiverList: [{ email: invitation.created_by, userId: inviterUserObj.id }],
        };
        const obj = {
          old: {},
          new: InviterObj,
        };
        ActivityLogs.addActivityLog(Entities.users.entity_name, Entities.users.event_name.inviteUserRegistered,
          obj, Entities.notes.event_name.added, user.id, body.company_id, inviterUserObj.id, null, null, source_IP);
      }
      const obj = {
        old: {},
        new: user,
      };
      ActivityLogs.addActivityLog(Entities.users.entity_name, Entities.users.event_name.added,
        obj, Entities.notes.event_name.added, user.id, body.company_id, user.id, null, null, source_IP);
      return user;
    }
    const err = ErrorCodes['900001'];
    throw err;
  }

  static async updateUser(body) {
    let oldObj = {};
    let newObj = {};
    const getuser = await database.users.findOne({ where: { id: body.user_id } });
    const user = await database.users.update(body, {
      where: { id: body.user_id },
      returning: true,
      plain: true,
    }).then((userData) => {
      const data = userData[1].dataValues;
      return data;
    });
    Object.keys(body).forEach((key) => {
      if (JSON.stringify(getuser[key]) != JSON.stringify(body[key])) {
        oldObj[key] = getuser[key];
        newObj[key] = body[key];
      }
    });
    const obj = {
      old: oldObj,
      new: newObj,
    };
    ActivityLogs.addActivityLog(Entities.users.entity_name, Entities.users.event_name.updated,
      obj, Entities.notes.event_name.updated, user.id, body.company_id, body.user_id, null);
    return user;
  }

  static async deleteUser(req) {
    const { id } = req.params;
    const { user_name } = req.body;
    const companyId = req.body.company_id;
    const createdBy = req.user_id;
    const updatedBy = req.user_id;
    const userId = req.user_id;
    const userToDelete = await database.users.findOne({ where: { id } });

    // call to deviceProvision - start
    const locationPermissionOfuser = await database.locations_permissions.findAll({
      where: {
        user_id: id,
        company_id: companyId,
      },
      raw: true,
      nest: true
    })
    // let locations = locationPermissionOfuser.map(lp=> lp.location_id);
    let adminData = await LocationPermissionsService.getAdminData(companyId);
    for (let element of locationPermissionOfuser) {
      await LocationPermissionsService.updateSharerListOnUserLocationUpdation(adminData, element.location_id, id, DPCommands.unshare, companyId, req.request_id);
    }
    // call to deviceProvision - end
    if (userToDelete) {
      const headerParams = {
        Authorization: req.headers['x-access-token'],
      };
      const userFormObj = {
        UserID: userToDelete.identity_id,
        Username: userToDelete.email,
        Command: DPCommands.removeUser,
      };
      await DeviceProvisionService.deviceProvison(headerParams, userFormObj, 0)
        .catch(() => {
          const err = ErrorCodes['380001'];
          throw err;
        });
      const jobObj = {};
      const append_obj = {
        UserToDeleteObj: userToDelete,
      }
      const Obj = {
        old: append_obj,
        new: {},
      }
      jobObj.message = Responses.responses.user_delete_job_message;
      ActivityLogs.addActivityLog(Entities.users.entity_name, Entities.users.event_name.delete_job,
        Obj, Entities.notes.event_name.added, userId, companyId, userId, null, null, req.source_IP);
      return (jobObj);
    }
    return null;
  }

  static async updateUserAttributes(req) {
    let oldObj = {};
    const companyId = req.body.company_id;
    const awsDetails = await getAWSDetailsFromCompanyId(companyId);
    const { email } = req.body;
    const before_UserObj = await this.getUserByEmail(email).catch((err) => { throw err; });
    const entity_id = before_UserObj.id;
    const credsPath = await createAWSCredentialPath(companyId);
    AWS.config.loadFromPath(credsPath);
    const attr = Object.keys(req.body.attributes).map((key) => {
      const attrDict = {};
      attrDict.Name = key;
      attrDict.Value = req.body.attributes[key];
      return attrDict;
    });
    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
      apiVersion: '2016-04-18',
    });
    return new Promise((resolve) => {
      cognitoidentityserviceprovider.adminUpdateUserAttributes(
        {
          UserAttributes: attr,
          UserPoolId: `${awsDetails.userPoolId}`,
          Username: email,
        },
        (err, data) => {
          if (err) {
            resolve(null);
          }
          resolve(data);
        },
      );
    }).then(() => new Promise((resolve) => {
      const params = {
        UserPoolId: `${awsDetails.userPoolId}`,
        Username: email,
      };
      cognitoidentityserviceprovider.adminGetUser(params, (err, data) => {
        if (err) {
          resolve(null);
        }// successful response
        const obj = data;
        if (data) {
          obj.created_by = req.user_id;
          obj.id = req.user_id;
          const mapped = data.UserAttributes.map((item) => ({ [item.Name]: item.Value }));
          const newObj = Object.assign({}, ...mapped);
          oldObj = {
            email: before_UserObj.email,
            phone_number: before_UserObj.phone_number,
            name: before_UserObj.name,
          };
          const userUpdateObj = {};
          if (newObj) {
            userUpdateObj.email = newObj.email;
            userUpdateObj.phone_number = newObj.phone_number || null;
            userUpdateObj.name = newObj.name || null;
          }
          this.updateUserInfo(userUpdateObj, newObj.sub, companyId);
          newObj.UserCreateDate = data.UserCreateDate;
          newObj.UserLastModifiedDate = data.UserLastModifiedDate;
          newObj.Enabled = data.Enabled;
          newObj.UserStatus = data.UserStatus;
          resolve(newObj);
          const updated_obj = {
            old: oldObj,
            new: userUpdateObj,
          };
          if (JSON.stringify(oldObj) != JSON.stringify(userUpdateObj)) {
            ActivityLogs.addActivityLog(Entities.user_attributes.entity_name, Entities.user_attributes.event_name.attribute_updated,
              updated_obj, Entities.notes.event_name.updated, entity_id, companyId, req.user_id, null, null, req.source_IP);
          }
        }
        resolve(null);
      });
    }));
  }

  static async getUsersOfLocation(req) {
    const locationPermissions = await LocationPermissionsService.getUsersOfLocation(
      req,
    ).catch((err) => err);
    return locationPermissions;
  }

  static async getNonUsersOfLocation(req) {
    const locationPermissions = await LocationPermissionsService.getNonUsersOfLocation(
      req,
    ).catch((err) => err);
    return locationPermissions;
  }

  static async getUsersLocation(req) {
    const locationPermissions = await AccessPermissionService.getLocationsOfUser(
      req,
    ).catch((err) => err);
    return locationPermissions;
  }

  static async updateAdminStatus(req) {
    let oldObj = {};
    const updatedValues = req.body;
    const getuser = await database.users.findOne({ where: { id: req.params.id } });
    const updateCompanies = await database.users.update(updatedValues, {
      where: { id: req.params.id },
      returning: true,
      raw: true,
    }).then((result) => {
      const data = result[1][0];
      return data;
    });
    oldObj = {
      isAdmin: getuser.isAdmin,
    };

    const obj = {
      old: oldObj,
      new: updatedValues,
    };
    if (JSON.stringify(oldObj.isAdmin) != JSON.stringify(updatedValues.isAdmin)) {
      ActivityLogs.addActivityLog(Entities.users.entity_name, Entities.users.event_name.admin_status_updated,
        obj, Entities.notes.event_name.updated, req.params.id, req.company_id, req.user_id, null, null, req.source_IP);
    }
    return updateCompanies;
  }

  static async getUserByEmail(email) {
    const user = await database.users.findOne({
      where: { email },
    });
    return user;
  }

  static async getDataTablePreferences(req, res) {
    const { id } = req.params;
    const dtPreferences = await database.user_datatable_preferences.findOne({
      where: { user_id: id },
      raw: true,
    });
    if (!dtPreferences) {
      const newdtPreferences = await database.user_datatable_preferences.create({
        user_id: id,
        preference: {},
      }).catch((e) => e);
      return newdtPreferences;
    }
    return dtPreferences;
  }

  static async createDataTablePreferences(req, res) {
    const { id } = req.params;
    const dtPreferences = await database.user_datatable_preferences.findOne({
      where: { user_id: id },
      raw: true,
    });
    if (!dtPreferences) {
      const newdtPreferences = await database.user_datatable_preferences.create({
        user_id: id,
        preference: req.body.preferences,
      }).catch((e) => e);
      return newdtPreferences;
    }
    const updatedObj = { preference: req.body.preferences };
    const updatedtPreferences = await database.user_datatable_preferences.update(updatedObj, {
      where: { user_id: id },
      returning: true,
      plain: true,
      raw: true,
    }).then((result) => result).catch((e) => e);
    return updatedtPreferences;
  }

  static async deleteDataTablePreferences(req, res) {
    const { id } = req.params;
    const get_dtPreferences = await database.user_datatable_preferences.findOne({
      where: { user_id: id },
      raw: true,
    });
    const get_locations_permissions = await database.locations_permissions.findAll({
      where: { user_id: id },
      raw: true,
    });
    let dtPreferences = {};
    let locationPermissions = {}
    if (get_dtPreferences) {
      dtPreferences = await database.user_datatable_preferences.destroy({
        where: { user_id: id },
      });
    }
    if (get_locations_permissions?.length > 0) {
      locationPermissions = await await database.locations_permissions.destroy({
        where: { user_id: id },
      });
      let adminData = await LocationPermissionsService.getAdminData();
      for (let location of get_locations_permissions) {
        LocationPermissionsService.updateSharerListOnUserLocationUpdation(adminData, location.id, id, DPCommands.unshare, req.company_id, req.request_id);
      }
    }
    return { dtPreferences, locationPermissions };
  }
}

export default UsersService;
