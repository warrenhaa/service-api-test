import lodash from 'lodash';
import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import UsersService from './UsersService';
import CompaniesService from './CompaniesService';
import locationLevels from '../../utils/constants/LocationTypes';
import LocationsService from './LocationsService';
import LocationTypesService from './LocationTypesService';
import OccupantLocationsService from './OccupantLocationsService';
import OccupantService from './OccupantService';
import DeviceProvisionService from './DeviceProvisionService';
import Entities from '../../utils/constants/Entities';
import ErrorCodes from '../../errors/ErrorCodes';
import { getCompany } from '../../cache/Companies';
import Logger from '../../utils/Logger';
import { getAWSDetailsFromCompanyId, createAWSCredentialPath } from '../helpers/AwsCredentials';
import { DPCommands } from '../../utils/constants/DeviceProvisionCommands';
import { getOneFromCache, setInCacheByKey } from '../../cache/Cache';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const AWS = require('aws-sdk');
const AwsConfig = require('./AwsConfig');
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});

class OccupantRegisterService {
  static async signUp(email, password, first_name, last_name,
    phone_number, country, locale, company_id, metadata) {
    return new Promise(async (resolve, reject) => {
      const AwsConstants = await getAWSDetailsFromCompanyId(company_id);
      const poolData = {
        UserPoolId: AwsConstants.userPoolId, // Your user pool id here
        ClientId: AwsConstants.aws_cognito_userpool_web_client_id, // Your client id here
      };
      AwsConfig.initAWS(AwsConstants.aws_region, AwsConstants.aws_cognito_identity_pool);
      AwsConfig.setCognitoAttributeList(email, first_name,
        last_name, phone_number, locale);
      AwsConfig.getUserPool(poolData).signUp(email, password,
        AwsConfig.getCognitoAttributeList(), null, async (err, result) => {
          if (err) {
            const error = ErrorCodes['160047'];
            reject(error);
            throw error;
          }
          let inviteId = null;
          const inviterUserId = null;
          const invite = await OccupantService.getInviteEmail(email)
            .catch((err) => { throw err; });
          if (invite) {
            inviteId = invite.id;
            const updateStatus = { status: Entities.occupant.event_name.status_accepted };
            await database.occupants_invitations.update(updateStatus, {
              where: {
                id: inviteId,
              },
            }).catch((error) => { throw error; });
          }
          const occupants = await database.occupants.create({
            email,
            company_id,
            cognito_id: result.userSub,
            first_name,
            invite_id: inviteId,
            phone_number,
            last_name,
            language: locale,
            country,
            status: 'created',
          }).then((result1) => result1).catch((error) => {
            throw (error);
          });
          if (metadata) {
            const inputMetadataObj = [];
            Object.keys(metadata).forEach((key) => {
              let value = metadata[key];
              if (value) {
                value = value.toString();
              }
              const obj = {
                key,
                value,
                occupant_id: occupants.id,
              };
              inputMetadataObj.push(obj);
            });
            const addMetaData = database.occupants_metadata.bulkCreate(inputMetadataObj)
              .catch((err1) => {
                throw (err1);
              });
            if (addMetaData) {
              const obj = {
                old: {},
                new: addMetaData,
              };
              ActivityLogs.addActivityLog(Entities.occupants_metadata.entity_name,
                Entities.occupants_metadata.event_name.added,
                obj, Entities.notes.event_name.added,
                occupants.id, company_id, null, occupants.id);
            }
          }
          const response1 = {
            username: result.user.username,
            userConfirmed: result.userConfirmed,
            occupants,
          };
          return resolve(response1);
        });
    });
  }

  static async verify(email, code, company_id) {
    return new Promise(async (resolve, reject) => {
      const AwsConstants = await getAWSDetailsFromCompanyId(company_id);
      const poolData = {
        UserPoolId: AwsConstants.userPoolId, // Your user pool id here
        ClientId: AwsConstants.aws_cognito_userpool_web_client_id, // Your client id here
      };
      AwsConfig.getCognitoUser(email, poolData).confirmRegistration(code, true, async (err, result) => {
        if (err) {
          const error = ErrorCodes['160049'];
          reject(error);
          throw error;
        }
        const update = {
          status: 'verified',
        };
        const updateOccupant = await database.occupants.update(update, {
          where: { email },
          returning: true,
          plain: true,
        }).then((res) => res[1]).catch((error) => {
          throw error;
        });
        const obj = {
          old: {},
          new: updateOccupant,
        };
        let inviterUserId = null;
        if (updateOccupant.invite_id) {
          const invite = await database.occupants_invitations.findOne({
            where: {
              email,
            },
          })
            .catch((error) => { throw error; });
          inviterUserId = invite.invited_by;
          const inviter = await database.users.findOne({
            where: { id: inviterUserId },
          }).catch((error) => { throw error; });

          const filter = `sub = "${inviter.cognito_id}"`;
          const inviterDetails = await UsersService.getUserCredentials(
            filter, company_id,
          ).catch((error) => { throw error; });

          const inviterEmailObj = lodash.filter(inviterDetails[0].Attributes, ['Name', 'email']);
          const inviterEmail = inviterEmailObj[0].Value;
          const placeholdersData = {
            inviter_email: inviterEmail,
            receiverList: [{ email: inviterEmail, userId: inviterUserId }],
          };
          ActivityLogs.addActivityLog(Entities.occupant.entity_name,
            Entities.occupant.event_name.joined,
            obj, Entities.notes.event_name.added, updateOccupant.id, company_id,
            inviterUserId, updateOccupant.id, placeholdersData);
        }
        const placeholdersData = {
          receiverList: [{ email: updateOccupant.email }],
        };
        ActivityLogs.addActivityLog(Entities.occupant.entity_name,
          Entities.occupant.event_name.added,
          obj, Entities.notes.event_name.added, updateOccupant.id, company_id,
          inviterUserId, updateOccupant.id, placeholdersData);
        return resolve(result);
      });
    });
  }

  static async signIn(req, email, password, company_id) {
    const occupant = await database.occupants.findOne({
      where: {
        email,
      },
    }).catch(() => {
      const err = ErrorCodes['160002'];
      throw err;
    });
    if (!occupant) {
      const err = ErrorCodes['160002'];
      throw err;
    }
    if (occupant.status === 'created') {
      const err = ErrorCodes['160048'];
      throw err;
    }
    const logIn = await UsersService.login(email, password, company_id).catch((err) => {
      throw err;
    });
    if (logIn) {
      if (occupant.status === 'registered') {
        return logIn;
      }
      const AwsConstants = await getAWSDetailsFromCompanyId(company_id);
      const data = {
        UserPoolId: AwsConstants.userPoolId, // Your user pool id here
        region: AwsConstants.aws_region,
        IdentityPoolId: AwsConstants.aws_cognito_identity_pool, // Your client id here
        AccountId: process.env.ACCOUNT_ID,
      };
      const identity_id = await AwsConfig.getId(logIn.id_token, data)
        .then(async (result) => (
          result.IdentityId // identity id
        ))
        .catch((err) => {
          console.log(err);
          throw (err);
        });
      const update = {
        status: 'registered',
        identity_id,
      };
      const form = {
        UserID: identity_id,
        Username: email,
        Command: 0,
      };
      const headerParams = {
        Authorization: logIn.access_token,
      };
      await DeviceProvisionService.deviceProvison(headerParams, form, 0)
        .then(async (result) => result)
        .catch((error) => {
          const err = ErrorCodes['380001'];
          throw err;
        });
      await database.occupants.update(update, {
        where: { email },
        returning: true,
        plain: true,
      }).then((res) => res).catch((error) => {
        throw error;
      });
      if (occupant.invite_id) {
        const inviteId = occupant.invite_id;
        // checking if occupant has locations or not using occupant_invite_id
        const listOfLocation = await database.occupants_locations.findAll({
          where: {
            occupant_invite_id: inviteId,
          },
        });
        if (listOfLocation.length > 0) {
          /* if occupant has locations then finding
           admin's access token and identity_id using cgnitoLogIn function */
          const AdminEmail = process.env.ADMIN_EMAIL;
          const AdminPassword = process.env.ADMIN_PASSWORD;
          const AdminData = await UsersService.cognitoLogin(req, AdminEmail, AdminPassword);
          const inputobj = {
            adminIdentityId: AdminData.identityId,
            accessToken: AdminData.accessToken,
            email,
            identity_id,
            adminEmail: AdminEmail,
          };
          listOfLocation.forEach(async (element) => {
            inputobj.location_id = element.dataValues.location_id;
            inputobj.occupant_id = occupant.id;
            inputobj.inviteId = inviteId;
            inputobj.id = element.dataValues.id;
            inputobj.element = element;
            // occupant check in to the respective location
            await OccupantService.checkInOccupant(req, inputobj).catch((err) => {
              throw (err);
            });
          });
        }
      }
      const companyDetails = await getCompany(company_id).then(result => {
        return (result);
      }).catch((error) => {
        console.log(error);
        throw (error);
      });
      if (!companyDetails) {
        const err = ErrorCodes['000001'];
        throw (err);
      }
      const { site } = companyDetails;
      const floorId = site.floor_id;

      // const type = await LocationTypesService.getLocationTypeByName(locationLevels[5]);
      // const defaultRoomInput = {
      //   company_id,
      //   name: `${email}_${companyDetails.code}_default_room`,
      //   type_id: type.id,
      //   container_id: floorId,
      //   user_id: null,
      // };
      // const defaultRoom = await LocationsService.createLocations(defaultRoomInput)
      //   .catch((error) => {
      //     const err = ErrorCodes['000007'];
      //     throw err;
      //   });
      // const occupantLocationInput = {
      //   location_id: defaultRoom.id,
      //   occupant_id: occupant.id,
      //   status: 'default',
      //   company_id,
      // };
      // await OccupantLocationsService.addOccupantLocation(
      //   occupantLocationInput.location_id, occupantLocationInput.status,
      //   occupantLocationInput.company_id, occupantLocationInput.occupant_id,
      // )
      //   .catch((error) => {
      //     const err = ErrorCodes['000007'];
      //     throw err;
      //   });
      const obj = {
        old: {},
        new: occupant,
      };
      // we need to find the permissions which need to add after register
      const occupantPermissions = await database.occupants_permissions.findAll({
        include: [
          {
            model: database.devices,
            as: 'gateway',
          }],
        where: {
          invitation_email: email,
        },
      }).catch(() => {
        const err = ErrorCodes['160026'];
        throw err;
      });
      if (occupantPermissions && occupantPermissions.length > 0) {
        const email1 = process.env.ADMIN_EMAIL;
        const password1 = process.env.ADMIN_PASSWORD;
        const AdminData = await UsersService.cognitoLogin(req, email1, password1);
        const headerParams = {
          Authorization: AdminData.accessToken,
        };
        for (const iterator of occupantPermissions) {
          const deviceFormObj = {
            UserID: AdminData.identityId,
            Username: iterator.invitation_email,
            DeviceID: iterator.gateway.device_code,
            Command: DPCommands.share,
          };
          await DeviceProvisionService.deviceProvison(headerParams, deviceFormObj, 0).catch((error) => {
            Logger.error('device provision error', error);
          });
          await database.occupants_permissions.update({
            receiver_occupant_id: occupant.id,
          }, {
            where: {
              invitation_email: iterator.invitation_email,
            },
          }).catch(() => {
            const err = ErrorCodes['160039'];
            throw err;
          });
        }
      }
      return logIn;
    }
  }

  static async passwordChanged(email, company_id) {
    try {
      const AwsConstants = await getAWSDetailsFromCompanyId(company_id);

      const adminGetUserParams = {
        UserPoolId: AwsConstants.userPoolId,
        Username: email,
      };

      await cognitoidentityserviceprovider.adminUserGlobalSignOut(adminGetUserParams).promise();
      const jwtExpired = process.env.JWT_EXPIRED;
      if (jwtExpired) {
        await setInCacheByKey('jwt_reset_password:'+email, adminGetUserParams, parseInt(jwtExpired))
          .then(async (result) => {})
          .catch((error) => {
            console.log(error);
          });
      }
    } catch (error) {
      throw error;
    }
  }

  static async passwordReset( email, company_id) {
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
      
      var userData = {
        Username: email,
        Pool: poolData,
        Pool: userPool
      };
      var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
      let isConfirmed = true
      const adminGetUserParams = {
        UserPoolId: AwsConstants.userPoolId, // Replace with your User Pool ID
        Username: email,
      };
      try {
        const response = await cognitoidentityserviceprovider.adminGetUser(adminGetUserParams).promise();
        if(response ){
           isConfirmed = response.UserStatus === "CONFIRMED";
        }
      } catch (error) {       
      }
  
      if(isConfirmed == false){
        const err = ErrorCodes['160048'];
        throw err;
      }
    var params = {
      ClientId: AwsConstants.aws_cognito_userpool_web_client_id,
      Username: email,
      AnalyticsMetadata: {
        AnalyticsEndpointId: cognitoUser.client.endpoint, 
      },
      ClientMetadata: {
        company: AwsConstants.company_code,
      }
    };  
     cognitoidentityserviceprovider.forgotPassword(params, function(err, data) {
      if (err){
        console.log(err, err.stack); 
        return err;
      } // an error occurred
      else { 
        return data;
      } // successful response
    });
    }
  }

export default OccupantRegisterService;
