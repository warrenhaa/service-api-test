import lodash from 'lodash';
import { Op } from 'sequelize';
import database from '../../models';
import OccupantLocationsService from './OccupantLocationsService';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import jobsService from './JobsService';
import userService from './UsersService';
import { getAWSDetailsFromCompanyId, createAWSCredentialPath } from '../helpers/AwsCredentials';
import Entities from '../../utils/constants/Entities';
import CheckAllDeviceAccess from '../helpers/CheckAllDeviceAccess';
import OccupantDashboardService from './OccupantDashboardService';
import OccupantsDashboardAttributesService from './OccupantsDashboardAttributesService';
import Responses from '../../utils/constants/Responses';
import Logger from '../../utils/Logger';
import CompaniesService from './CompaniesService';
import locationLevels from '../../utils/constants/LocationTypes';
import LocationsService from './LocationsService';
import LocationTypesService from './LocationTypesService';
import DeviceProvisionService from './DeviceProvisionService';
import OccupantsGroupsService from './OccupantsGroupsService';
import { DPCommands } from '../../utils/constants/DeviceProvisionCommands';
import { getCompany } from '../../cache/Companies';
import cameraDeviceActionQueue from '../../sqs/CameraDeviceActionQueueProducer';
import communicateWithAwsIotService from './CommunicateWithAwsIotService';
const moment = require('moment');
const AWS = require('aws-sdk');
const { data } = require('../../cache/constantFromConfigs')

class OccupantService {
  static async getInvitationcode() {
    const randomnumber = Math.random().toString().substr(2, 6);
    const result = await database.occupants_invitations.findOne({
      where: { invite_code: randomnumber },
    });
    if (result) {
      this.getInvitationcode();
    }
    return randomnumber;
  }

  static async getinvite(req) {
    const invite = await database.occupants_invitations.findOne({
      where: {
        email: req.body.email,
      },
    });
    return invite;
  }

  static async getOccupantsEmail(req) {
    const checkOccupant = await database.occupants.findOne({
      where: {
        // company_id: req.body.company_id,
        email: req.body.email,
      },
    }).catch((err) => {
      throw err;
    });

    return checkOccupant;
  }

  static async getOccupantPermissions(occupant_id, company_id) {
    const linkedCompanies = await this.getlinkedCompanies(company_id)
      .catch((error) => {
        throw (error);
      });
    const result = await database.occupants_permissions.findAll({
      include: [{
        attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number', 'identity_id', 'cognito_id'],
        model: database.occupants,
        as: 'receiver_occupant',
      },
      {
        attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number', 'identity_id', 'cognito_id'],
        model: database.occupants,
        as: 'sharer_occupant',
      },
      {
        attributes: ['id', 'name', 'model', 'device_code', 'type'],
        model: database.devices,
        as: 'gateway',
        include: [
          {
            model: database.camera_devices,
            required: false,
          },
        ],
      },
      {
        model: database.occupants_camera_permissions,
        as: 'camera_permissions',
        include: [
          {
            model: database.camera_devices,
            required: false,
          },
        ],
      }
      ],
      where: { receiver_occupant_id: occupant_id, company_id: { [Op.in]: linkedCompanies } },
    });
    return result;
  }

  static async formatLocations(accessToList) {
    let accessLocations = '';
    for (const key in accessToList) {
      const element = accessToList[key];
      accessLocations += element;
      if (key != accessToList.length - 1) {
        accessLocations += '<br>';
      }
    }
    return accessLocations;
  }

  static async addOccupantInvitation(req) {
    let newObj = {};
    const Day = process.env.OCCUPANT_EXPIRE_AFTER_DAYS;
    const expiryDate = new Date(Date.now() + Day * 24 * 60 * 60 * 1000);
    let occupanCheckIn = null;
    const accessToList = [];
    const inviteCode = await this.getInvitationcode();
    const checkOccupant = await this.getOccupantsEmail(req).then(
      (result) => result,
    );
    if (checkOccupant) {
      const err = ErrorCodes['160000'];
      throw err;
    }
    const locationIds = req.body.location_ids;
    const { body } = req;
    const { userDetails } = req;
    body.email = body.email.toLowerCase();
    const inviteToSend = await database.occupants_invitations.findOne({
      where: {
        email: body.email,
      },
    });
    if (inviteToSend) {
      const err = ErrorCodes['160009'];
      throw err;
    }
    const invite = await database.occupants_invitations.create({
      email: body.email,
      invite_code: inviteCode,
      invited_by: req.user_id,
      invited_at: new Date(),
      status: 'invited',
      expires_at: expiryDate,
      company_id: body.company_id,
    }).catch((err) => {
      throw err;
    });

    if (invite && body.location_ids) {
      for (const key in locationIds) {
        const element = locationIds[key];
        occupanCheckIn = await database.occupants_locations.create({
          location_id: element,
          occupant_invite_id: invite.id,
          check_in_by: req.user_id,
          check_in_at: new Date(),
          company_id: body.company_id,
          status: 'invited',
        }).catch((err) => {
          throw err;
        });
        const accessTo = await database.locations.findOne({
          where: {
            id: element,
          },
        });
        let address = accessTo.path.breadcrumb;
        address = address.replace(/[/]/g, ', ');
        address = address.replace(/[,]/g, ',/');
        address = address.split(',').reverse().join('');
        address = address.substring(2);
        address = address.replace(/[/]/g, ',');
        address = address.split(',');
        for (const key in address) {
          accessToList.push(address[key]);
        }

        const locationObj = {
          old: {},
          new: occupanCheckIn,
        };
        ActivityLogs.addActivityLog(Entities.occupant.entity_name,
          Entities.occupant.event_name.location_updated, locationObj,
          Entities.notes.event_name.added, invite.id,
          body.company_id, req.user_id);
        ActivityLogs.addActivityLog(Entities.locations.entity_name,
          Entities.occupant.event_name.invitation_checkin, locationObj,
          Entities.notes.event_name.added, element,
          body.company_id, req.user_id);
      }
    }
    const accessLocations = await OccupantService.formatLocations(accessToList);
    const access = (accessLocations !== null) ? accessLocations : 'No Access';
    const companyDetails = await getCompany(body.company_id).then(result => {
      return (result);
    }).catch((error) => {
      console.log(error);
      throw (error);
    });
    if (!companyDetails) {
      const err = ErrorCodes['000001'];
      throw (err);
    }
    const buttonLink = companyDetails.app_urls.android;
    newObj = {
      invitee_email: body.email,
      status: invite.status,
      invite_code: inviteCode,
      inviter_email: userDetails.email,
      expires_at: moment(new Date(invite.expires_at)).utc().format('DD-MM-YYYY hh:mm A'),
      button_link: buttonLink,
      access_to: access,
    };
    const placeholdersData = {
      receiverList: [{ email: body.email }],
    };
    const obj = {
      old: {},
      new: newObj,
    };
    await ActivityLogs.addActivityLog(Entities.occupant.entity_name,
      Entities.occupant.event_name.invite_added,
      obj, Entities.notes.event_name.added, invite.id,
      body.company_id, req.user_id, null, placeholdersData);
    return invite;
  }

  static async getAllOccupants(req) {
    const companyId = req.body.company_id;
    const locationWhere = {};
    locationWhere.status = 'checked in';
    const locationId = req.query.location_id;
    let required = false;
    if (locationId) {
      required = true;
      locationWhere.location_id = locationId;
    }
    const occupants = await database.occupants
      .findAll({
        include: [{
          required,
          model: database.occupants_locations,
          order: [['created_at', 'desc']],
          where: locationWhere,
        }],
        where: {
          company_id: companyId,
        },
        order: [['created_at', 'desc']],
      })
      .then((result) => result);
    return occupants;
  }

  static async getInviteEmail(email) {
    const invite = await database.occupants_invitations.findOne({
      where: {
        email,
        [Op.or]: [{ status: 'resend' }, { status: 'invited' }],
      },
    });
    return invite;
  }

  static async resendOccupantInvitation(id, req) {
    let oldObj = {};
    let newObj = {};
    const LocationIds = [];
    const Day = process.env.OCCUPANT_EXPIRE_AFTER_DAYS;
    const expiryDate = new Date(Date.now() + Day * 24 * 60 * 60 * 1000);
    const inviteToResend = await database.occupants_invitations.findOne({
      where: { id },
    });
    const date = new Date().toISOString().slice(0, 10);
    const occupantResendCount = `SELECT COUNT(*) FROM activity_logs 
    WHERE event_name LIKE '%OccupantInviteResent%' 
    AND entity_id = :entity_id
    AND  DATE(created_at)= :date`;

    const resendCount = await database.sequelize.query(
      occupantResendCount,
      {
        raw: true,
        replacements: { entity_id: id, date },
        logging: console.log,
      },
    );
    const arrayCount = resendCount[0];
    if (arrayCount[0].count >= 100) {
      Logger.error(`Maximum limit of 100 for ${id} Occupant Resend Invitation exceeded`);
      const err = ErrorCodes['160021'];
      throw err;
    }

    if (inviteToResend && inviteToResend.dataValues.status !== 'accepted' && inviteToResend.dataValues.status !== 'expired') {
      const inviteCode = await OccupantService.getInvitationcode();
      const updateInvite = {
        status: Entities.occupant.event_name.status_resend,
        invite_code: inviteCode,
        expires_at: expiryDate,
      };
      await database.occupants_invitations.update(updateInvite, {
        where: { id },
        returning: true,
        plain: true,
      });
      const updatedResend = await database.occupants_invitations.findOne({
        where: { id },
      });
      const accessToList = [];
      const occupantLocations = await database.occupants_locations.findAll({
        where: { occupant_invite_id: updatedResend.id },
      });
      for (const key in occupantLocations) {
        const element = occupantLocations[key];
        const accessLocations = await database.locations.findOne({
          where: { id: element.location_id },
        });
        let location_name = accessLocations.path.breadcrumb;
        location_name = location_name.replace(/[/]/g, ', ');
        location_name = location_name.replace(/[,]/g, ',/');
        location_name = location_name.split(',').reverse().join('');
        location_name = location_name.substring(2);
        location_name = location_name.replace(/[/]/g, ',');
        location_name = location_name.split(',');
        for (const key in location_name) {
          accessToList.push(location_name[key]);
        }
      }
      const companyDetails = await getCompany(req.body.company_id).then(result => {
        return (result);
      }).catch((error) => {
        console.log(error);
        throw (error);
      });
      if (!companyDetails) {
        const err = ErrorCodes['000001'];
        throw (err);
      }
      const buttonLink = companyDetails.app_urls.android;
      const accessLocations = await OccupantService.formatLocations(accessToList);
      const access = (accessLocations !== null) ? accessLocations : 'No Access';

      const { body } = req;
      const { userDetails } = req;
      oldObj = {
        invitee_email: inviteToResend.email,
        inviter_email: userDetails.email,
        invite_code: inviteToResend.invite_code,
        status: inviteToResend.status,
        expires_at: inviteToResend.expires_at,
        access_to: access,
      };
      newObj = {
        invitee_email: updatedResend.email,
        inviter_email: userDetails.email,
        invite_code: inviteCode,
        status: updatedResend.status,
        button_link: buttonLink,
        expires_at: moment(new Date(updatedResend.expires_at)).utc().format('DD-MM-YYYY hh:mm A'),
        access_to: access,
      };
      const placeholdersData = {
        receiverList: [{ email: updatedResend.email }],
      };
      const obj = {
        old: oldObj,
        new: newObj,
      };
      ActivityLogs.addActivityLog(Entities.occupant.entity_name, Entities.occupant.event_name.invite_resend,
        obj, Entities.notes.event_name.updated, id, body.company_id, req.user_id, null, placeholdersData);
      return updatedResend;
    }
    return null;
  }

  static async expireInvitation(req) {
    const { body } = req;
    const status = Entities.occupant.event_name.status_expired;
    const expireInvitations = await database.occupants_invitations.update({ status },
      {
        where: {
          expires_at: {
            [Op.lte]: moment().toDate(),
          },
          status: {
            [Op.notIn]: ['accepted', 'expired'],
          },
        },
        returning: true,
      }).then((result) => result[1]).catch((err) => {
        throw (err);
      });
    expireInvitations.forEach((element) => {
      const obj = {
        old: {},
        new: element,
      };
      ActivityLogs.addActivityLog(Entities.occupant.entity_name, Entities.occupant.event_name.invite_expire,
        obj, Entities.notes.event_name.updated, element.id, body.company_id, req.user_id, null);
    });
    return expireInvitations;
  }

  static async editInviteLocation(id, req) {
    const locationIds = req.body.location_ids;
    const oldLocationList = [];
    const accessToList = [];
    const checkInvite = await database.occupants_invitations.findOne({ where: { id } });
    if (checkInvite === null) {
      const err = ErrorCodes['160012'];
      throw err;
    } else if (checkInvite.dataValues.status === 'accepted') {
      const err = ErrorCodes['160013'];
      throw err;
    } else {
      // finding the list of old locations of occupant invite
      const checkLocation = await database.occupants_locations.findAll(
        {
          where: {
            occupant_invite_id: id,
          },
        },
      );
      checkLocation.forEach(async (element) => {
        oldLocationList.push(element.location_id);
      });
      // add the old location lists id's in new location if it is not present in newlist.
      const newLocationList = oldLocationList.filter((element) => !locationIds.includes(element))
        .concat(locationIds.filter((element) => !oldLocationList.includes(element)));
      newLocationList.forEach(async (element) => {
        // checking the location whether its present in the database or not
        const checkElement = await database.occupants_locations.findOne(
          {
            where: {
              occupant_invite_id: id,
              location_id: element,
            },
          },
        );
        // if location is not there in the occupant location table then create the new record
        // and if it is present then destroy the record
        if (checkElement === null) {
          const occupantCheckIn = await database.occupants_locations.create({
            location_id: element,
            occupant_invite_id: id,
            check_in_by: req.user_id,
            check_in_at: new Date(),
            company_id: req.body.company_id,
            status: 'invited',
          }).catch((err) => {
            throw err;
          });
          const locationData = await database.locations.findOne({
            where: {
              id: element,
            },
          }).catch((err) => {
            throw err;
          });
          let access = locationData.path.breadcrumb;
          access = access.replace(/[/]/g, ', ');
          access = access.replace(/[,]/g, ',/');
          access = access.split(',').reverse().join('');
          access = access.substring(2);
          access = access.replace(/[/]/g, ',');
          access = access.split(',');
          for (const key in access) {
            accessToList.push(access[key]);
          }

          const accessLocations = await this.formatLocations(accessToList);
          const final_access = (accessLocations !== null) ? accessLocations : 'No Access';
          const { userDetails } = req;
          const companyDetails = await getCompany(req.body.company_id).then(result => {
            return (result);
          }).catch((error) => {
            console.log(error);
            throw (error);
          });
          if (!companyDetails) {
            const err = ErrorCodes['000001'];
            throw (err);
          }
          const buttonLink = companyDetails.app_urls.android;
          const locationObj = {
            old: {},
            new: occupantCheckIn,
          };
          const placeholdersData = {
            access_to: final_access,
            inviter_email: userDetails.email,
            button_link: buttonLink,
            expires_at: moment(new Date(checkInvite.expires_at)).utc().format('DD-MM-YYYY hh:mm A'),
            receiverList: [{ email: checkInvite.email }],
          };
          ActivityLogs.addActivityLog(Entities.occupant.entity_name,
            Entities.occupant.event_name.location_updated, locationObj,
            Entities.notes.event_name.added, id,
            req.body.company_id, req.user_id);
          ActivityLogs.addActivityLog(Entities.locations.entity_name,
            Entities.occupant.event_name.invitation_checkin_updated, locationObj,
            Entities.notes.event_name.added, element,
            req.body.company_id, req.user_id, null, placeholdersData);
        } else {
          await database.occupants_locations.destroy({
            where: {
              occupant_invite_id: id,
              location_id: element,
            },
          }).catch((err) => {
            throw (err);
          });
          const locationObj = {
            old: checkElement,
            new: {},
          };
          ActivityLogs.addActivityLog(Entities.occupant.entity_name,
            Entities.occupant.event_name.location_updated, locationObj,
            Entities.notes.event_name.added, id,
            req.body.company_id, req.user_id);
          ActivityLogs.addActivityLog(Entities.locations.entity_name,
            Entities.locations.event_name.occupant_invitation_updated, locationObj,
            Entities.notes.event_name.deleted, element,
            req.body.company_id, req.user_id);
        }
      });
    }
    return checkInvite;
  }

  static async deleteOccupantInvite(id, req) {
    const { body } = req;
    const { userDetails } = req;
    const accessTo = [];
    const LocationIds = [];
    let access = null;
    const inviteToDelete = await database.occupants_invitations.findOne({ where: { id } });
    if (inviteToDelete && inviteToDelete.dataValues.status !== 'accepted') {
      const checkedInInvite = await database.occupants_locations.findAll(
        {
          where: { occupant_invite_id: inviteToDelete.id },
        },
      );
      for (const key in checkedInInvite) {
        const element = checkedInInvite[key];
        const accessLocations = await database.locations.findOne({
          where: { id: element.location_id },
        });

        let location_name = accessLocations.path.breadcrumb;
        location_name = location_name.replace(/[/]/g, ', ');
        location_name = location_name.replace(/[,]/g, ',/');
        location_name = location_name.split(',').reverse().join('');
        location_name = location_name.substring(2);
        location_name = location_name.replace(/[/]/g, ',');
        location_name = location_name.split(',');
        for (const key in location_name) {
          accessTo.push(location_name[key]);
        }
      }
      const accessLocations = await OccupantService.formatLocations(accessTo);
      access = (accessLocations !== null) ? accessLocations : 'No Access';

      if (checkedInInvite.length > 0) {
        await database.occupants_locations.destroy({
          where: { occupant_invite_id: id },
        }).catch((err) => {
          throw (err);
        });
        checkedInInvite.forEach(async (element) => {
          ActivityLogs.addActivityLog(Entities.locations.entity_name,
            Entities.locations.event_name.occupant_invitation_deleted, element,
            Entities.notes.event_name.deleted, element.location_id,
            body.company_id, req.user_id);
        });
      }
      const deletedInvite = await database.occupants_invitations.destroy({
        where: { id },
      }).catch((err) => {
        throw (err);
      });
      const data = { inviteToDelete };
      data.access_to = access;
      data.inviter_email = userDetails.email;
      const obj = {
        old: data,
        new: {},
      };
      const placeholdersData = {
        receiverList: [{ email: inviteToDelete.email }],
      };
      ActivityLogs.addActivityLog(Entities.occupant.entity_name,
        Entities.occupant.event_name.invite_delete,
        obj, Entities.notes.event_name.deleted, inviteToDelete.id,
        body.company_id, req.user_id, null, placeholdersData);
      return deletedInvite;
    }
    return null;
  }

  static async getOccupant(occupantId) {
    const occupantsObj = await database.occupants
      .findOne({
        where: {
          id: occupantId,
        },
      })
      .then((result) => result);
    if (!occupantsObj) {
      const err = ErrorCodes['160002'];
      throw err;
    }
    return occupantsObj;
  }

  static async addOccupantDefaultLocation(company_id, email, occupant_id) {
    // get company details from cache, if not present set
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

    const type = await LocationTypesService.getLocationTypeByName(locationLevels[5]);
    const defaultRoomInput = {
      company_id,
      name: `${email}_${companyDetails.code}_default_room`,
      type_id: type.id,
      container_id: floorId,
      user_id: null,
    };
    const defaultRoom = await LocationsService.createLocations(defaultRoomInput)
      .catch((error) => {
        const err = ErrorCodes['000007'];
        throw err;
      });
    const occupantLocationInput = {
      location_id: defaultRoom.id,
      occupant_id,
      status: 'default',
      company_id,
    };
    const occupantDefaultLocation = await OccupantLocationsService.addOccupantLocation(occupantLocationInput.location_id, occupantLocationInput.status, occupantLocationInput.company_id, occupantLocationInput.occupant_id)
      .catch((error) => {
        const err = ErrorCodes['000007'];
        throw err;
      });
    return occupantDefaultLocation;
  }

  static async handleSharePermissionError(iterator, occupants, data, body, req) {
    await database.occupants_permissions.destroy({
      where: {
        id: iterator.id,
      },
    }).catch(() => {
      const err = ErrorCodes['160039'];
      throw err;
    });
    const placeholdersData = {
      email: iterator.sharer_occupant.email,
      receiver_name: occupants.first_name || occupants.email,
      gateway_name: iterator.gateway.name,
      gateway_code: iterator.gateway.device_code,
      receiverList: [{ email: iterator.sharer_occupant.email }],
    };
    let activityObj = {
      error: "Device Provision error",
      occupant: occupants
    }
    ActivityLogs.addActivityLog(Entities.occupant.entity_name, Entities.occupant.event_name.owner_occupant_permission_failed,
      activityObj, Entities.notes.event_name.added, occupants.id, body.company_id, req.user_id, occupants.id, placeholdersData);
    Logger.error('device provision error', "Device Provision error", data);
  }

  static async addOccupants(req) {
    let { country } = req.body;
    const { body } = req;
    const accessToken = req.headers['x-access-token'];
    const checkOccupant = await this.getOccupantsEmail(req).then(
      (result) => result,
    ).catch((err) => {
      throw (err);
    });
    if (checkOccupant) {
      const err = ErrorCodes['160000'];
      throw err;
    }
    let inviteId = null;
    let inviterEmail = null;
    let inviterUserId = null;
    body.email = body.email.toLowerCase();
    const invite = await this.getInviteEmail(body.email).catch((err) => { throw err; });
    if (invite) {
      inviteId = invite.id;
      inviterUserId = invite.invited_by;
      const updateStatus = { status: Entities.occupant.event_name.status_accepted };
      await database.occupants_invitations.update(updateStatus, {
        where: {
          id: inviteId,
        },
      }).catch((err) => { throw err; });

      const inviter = await database.users.findOne({
        where: { id: inviterUserId },
      }).catch((err) => { throw err; });

      const filter = `sub = "${inviter.cognito_id}"`;
      const inviterDetails = await userService.getUserCredentials(
        filter, body.company_id,
      ).catch((err) => { throw err; });

      const inviterEmailObj = lodash.filter(inviterDetails[0].Attributes, ['Name', 'email']);
      inviterEmail = inviterEmailObj[0].Value;
    }

    const filter = `email = "${body.email}"`;
    const occupantDetails = await userService.getUserCredentials(
      filter, body.company_id,
    ).catch((err) => { throw err; });
    let cognitoId = null;
    let phoneNumber = null;
    let first_name = null;
    let lastName = null;
    let language = null;

    if (occupantDetails && occupantDetails.length > 0) {
      const subObj = lodash.filter(occupantDetails[0].Attributes, [
        'Name',
        'sub',
      ]);
      const nameObj = lodash.filter(occupantDetails[0].Attributes, [
        'Name',
        'name',
      ]);
      const phoneNumberObj = lodash.filter(occupantDetails[0].Attributes, [
        'Name',
        'phone_number',
      ]);
      const lastNameObj = lodash.filter(occupantDetails[0].Attributes, [
        'Name',
        'family_name',
      ]);
      const languageObj = lodash.filter(occupantDetails[0].Attributes, [
        'Name',
        'locale',
      ]);
      const countryObj = lodash.filter(occupantDetails[0].Attributes, [
        'Name',
        'custom:country',
      ]);
      if (subObj.length > 0) {
        cognitoId = subObj[0].Value;
      }
      if (phoneNumberObj.length > 0) {
        phoneNumber = phoneNumberObj[0].Value;
      }
      if (nameObj.length > 0) {
        first_name = nameObj[0].Value;
      }
      if (lastNameObj.length > 0) {
        lastName = lastNameObj[0].Value;
      }
      if (languageObj.length > 0) {
        language = languageObj[0].Value;
      }
      if (countryObj.length > 0) {
        country = countryObj[0].Value;
      }

      if (accessToken) {
        const headerParams = {
          Authorization: accessToken,
        };
        const deviceFormObj = {
          UserID: body.identity_id,
          Username: body.email,
          Command: DPCommands.createUser,
        };
        await DeviceProvisionService.deviceProvison(headerParams, deviceFormObj, 0)
          .catch((error) => {
            Logger.error('device provision error', error);
            const err = ErrorCodes['380001'];
            throw err;
          });
      }
      const occupants = await database.occupants.create({
        email: body.email,
        company_id: body.company_id,
        cognito_id: cognitoId,
        identity_id: body.identity_id,
        invite_id: inviteId,
        first_name,
        phone_number: phoneNumber,
        last_name: lastName,
        language,
        country,
      }).catch((err) => {
        throw (err);
      });
      if (body.metadata) {
        const inputMetadataObj = [];
        let privacy_version_key = 'latest_privacy_version'
        let privacy_version_constant = await data(privacy_version_key);
        if (privacy_version_constant) {
          let privacy_version = {
            key: "privacy_version",
            value: privacy_version_constant,
            occupant_id: occupants.id,
          }
          inputMetadataObj.push(privacy_version);
        }
        let term_version_key = 'latest_term_version'
        let term_version_constant = await data(term_version_key);
        if (term_version_constant) {
          let term_version = {
            key: "term_version",
            value: term_version_constant,
            occupant_id: occupants.id,
          }
          inputMetadataObj.push(term_version);
        }
        Object.keys(body.metadata).forEach((key) => {
          let value = body.metadata[key];
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
        const addMetaData = await database.occupants_metadata.bulkCreate(inputMetadataObj)
          .catch((err) => {
            throw (err);
          });
        if (addMetaData) {
          const obj = {
            old: {},
            new: addMetaData,
          };
          ActivityLogs.addActivityLog(Entities.occupants_metadata.entity_name, Entities.occupants_metadata.event_name.added,
            obj, Entities.notes.event_name.added, occupants.id, body.company_id, req.user_id, occupants.id);
        }
      }
      if (invite) {
        // checking if occupant has locations or not using occupant_invite_id
        const listOfLocation = await database.occupants_locations.findAll({
          where: {
            occupant_invite_id: inviteId,
          },
        });
        if (listOfLocation.length > 0) {
          /* if occupant has locations then finding
           admin's access token and identity_id using cgnitoLogIn function */
          const email = process.env.ADMIN_EMAIL;
          const password = process.env.ADMIN_PASSWORD;
          const AdminData = await userService.cognitoLogin(req, email, password);
          const inputobj = {
            adminIdentityId: AdminData.identityId,
            accessToken: AdminData.accessToken,
            email: body.email,
            identity_id: body.identity_id,
            adminEmail: email,
          };
          listOfLocation.forEach(async (element) => {
            inputobj.location_id = element.dataValues.location_id;
            inputobj.occupant_id = occupants.id;
            inputobj.inviteId = inviteId;
            inputobj.id = element.dataValues.id;
            inputobj.element = element;
            // occupant check in to the respective location
            await this.checkInOccupant(req, inputobj).catch((err) => {
              throw (err);
            });
          });
        }
      }
      const companyDetails = await getCompany(req.company_id).then(result => {
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
      //   company_id: req.company_id,
      //   name: `${body.email}_${companyDetails.code}_default_room`,
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
      //   occupant_id: occupants.id,
      //   status: 'default',
      //   company_id: req.company_id,
      // };
      // await OccupantLocationsService.addOccupantLocation(occupantLocationInput.location_id, occupantLocationInput.status, occupantLocationInput.company_id, occupantLocationInput.occupant_id)
      //   .catch((error) => {
      //     const err = ErrorCodes['000007'];
      //     throw err;
      //   });

      const obj = {
        old: {},
        new: occupants,
      };
      // we need to find the permissions which need to add after register
      const occupantPermissions = await database.occupants_permissions.findAll({
        include: [
          {
            model: database.devices,
            as: 'gateway',
          },
          {
            attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number', 'identity_id', 'cognito_id'],
            model: database.occupants,
            as: 'sharer_occupant',
          },
        ],
        where: {
          invitation_email: body.email,
        },
      }).catch(() => {
        const err = ErrorCodes['160026'];
        throw err;
      });
      if (occupantPermissions && occupantPermissions.length > 0) {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        const AdminData = await userService.cognitoLogin(req, email, password);
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
          await DeviceProvisionService.deviceProvison(headerParams, deviceFormObj, 0)
            .then(async (result) => {
              const { data } = result;
              if (data.errorMessage) {
                await this.handleSharePermissionError(iterator, occupants, data, body, req).catch((error) => {
                  console.log(error)
                });
              } else if (data.statusCode != 200) {
                await this.handleSharePermissionError(iterator, occupants, data, body, req).catch((error) => {
                  console.log(error)
                });
              } else {
                await database.occupants_permissions.update({
                  receiver_occupant_id: occupants.id,
                }, {
                  where: {
                    invitation_email: iterator.invitation_email,
                  },
                }).catch(() => {
                  const err = ErrorCodes['160039'];
                  throw err;
                });
                // pin the gateway
                const parentGateway = iterator.gateway;
                if (parentGateway.type == 'gateway') {
                  const bodyUpdate = {
                    item_id: parentGateway.id,
                    type: 'gateway',
                    grid_order: await OccupantsGroupsService.getRandomGridOrder(),
                  };
                  await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(bodyUpdate,
                    body.company_id, occupants.id);
                }
                let input = {
                  gateway_id: iterator.gateway.id,
                  company_id: body.company_id,
                  receiver_occupant_id: occupants.id
                }
                await jobsService.createJob('occupantsGatewayDashboardAttributesJob', input, body.company_id, null, null, null, req.request_id)
                  .then(async (resp) => resp)
                  .catch((err) => {
                    throw (err);
                  });
              }
            }).catch(async (error) => {
              await database.occupants_permissions.destroy({
                where: {
                  id: iterator.id,
                },
              }).catch(() => {
                const err = ErrorCodes['160039'];
                throw err;
              });
              const placeholdersData = {
                email: iterator.sharer_occupant.email,
                receiver_name: occupants.first_name || occupants.email,
                gateway_name: iterator.gateway.name,
                gateway_code: iterator.gateway.device_code,
                receiverList: [{ email: iterator.sharer_occupant.email }],
              };
              let activityObj = {
                error: error,
                occupant: occupants
              }
              ActivityLogs.addActivityLog(Entities.occupant.entity_name, Entities.occupant.event_name.owner_occupant_permission_failed,
                activityObj, Entities.notes.event_name.added, occupants.id, body.company_id, req.user_id, occupants.id, placeholdersData);
              Logger.error('device provision error', error);
            });
          const sharer_occupant_id = (iterator.sharer_occupant) ? iterator.sharer_occupant.identity_id : iterator.sharer_occupant_id;
          // find all, any permission exist in occcamper table
          const getAllOccPerIdCameraRecords = await database.occupants_camera_permissions.findAll({
            where: {
              occupant_permission_id: iterator.id,
            },
          }).then((result) => {
            return result;
          }).catch((error) => {
            const err = ErrorCodes['470008'];
            throw err;
          });
          if (getAllOccPerIdCameraRecords && getAllOccPerIdCameraRecords.length > 0) {
            for (const key in getAllOccPerIdCameraRecords) {
              const singleOccCamPerRecord = getAllOccPerIdCameraRecords[key];
              const camera_device_id = singleOccCamPerRecord.camera_device_id;
              // check the camera device id is present here exists in camera devices table,
              // if yes get the camera_id.
              const cameraDeviceExist = await database.camera_devices.findOne({
                where: { id: camera_device_id },
                raw: true,
              }).then((result) => result)
                .catch((error) => {
                  const err = ErrorCodes['470005'];
                  throw err;
                });
              if (cameraDeviceExist) {
                const data = {
                  occupant_id: occupants.identity_id,
                  camera_id: cameraDeviceExist.camera_id,
                  action: {
                    type: "access",
                    event: "share",
                    value: sharer_occupant_id,
                  },
                  time: moment(new Date()).utc().format('DD-MM-YYYY'),
                }
                // send this object in action queue
                cameraDeviceActionQueue.sendProducer(data);
              }
            } // end for 
          } // end if
        } //end for occ per's
      } // end if occ per's
      if (inviterEmail) {
        const placeholdersData = {
          receiverList: [{ email: inviterEmail, userId: inviterUserId }],
        };
        ActivityLogs.addActivityLog(Entities.occupant.entity_name,
          Entities.occupant.event_name.joined,
          obj, Entities.notes.event_name.added, occupants.id, body.company_id,
          inviterUserId, occupants.id, placeholdersData);
      }
      const placeholdersData = {
        receiverList: [{ email: occupants.email }],
      };
      ActivityLogs.addActivityLog(Entities.occupant.entity_name, Entities.occupant.event_name.added,
        obj, Entities.notes.event_name.added, occupants.id, body.company_id,
        inviterUserId, occupants.id, placeholdersData);
      return occupants;
    }
    const err = ErrorCodes['160002'];
    throw err;
  }

  static async checkInOccupant(req, inputobj) {
    // function for the occupant check in & giving access to the devices while registering
    const occupantId = inputobj.occupant_id;
    const locationId = inputobj.location_id;
    const CheckInid = inputobj.id;
    const companyId = req.company_id;
    const status = Entities.occupant.event_name.status_checkin;
    const createdBy = req.user_id;
    const updatedBy = req.user_id;
    const accessToList = [];
    const input = {
      userIdentityId: inputobj.identity_id,
      userName: inputobj.email,
      locationId,
      occupantId,
      adminIdentityId: inputobj.adminIdentityId,
      authorization: inputobj.accessToken,
      adminEmail: inputobj.adminEmail,
    };
    const updateObj = {
      occupant_id: occupantId,
      check_in_by: req.user_id,
      check_in_at: new Date(),
      status,
    };
    const occupantBeforeCheckIn = inputobj.element;
    const occupantCheckIn = await database.occupants_locations.update(updateObj, {
      where: { id: CheckInid },
      returning: true,
      plain: true,
    }).then(async (result) => {
      const occupantCheckInObj = result;
      const jobObj = await jobsService.createJob('locationCheckIn', input, companyId, createdBy, updatedBy, null, req.request_id)
        .then(async (resp) => resp)
        .catch((err) => {
          throw (err);
        });
      occupantCheckInObj.jobId = jobObj.id;
      return { occupantCheckInObj };
    }).catch((err) => {
      throw (err);
    });

    const occupantData = await database.occupants.findOne({
      where: {
        id: occupantId,
      },
    }).catch((err) => {
      throw err;
    });
    const locationData = await database.locations.findOne({
      where: {
        id: locationId,
      },
    }).catch((err) => {
      throw err;
    });
    let access = locationData.path.breadcrumb;
    access = access.replace(/[/]/g, ', ');
    access = access.substring(2);
    access = access.replace(/[,]/g, '');
    access = access.split(' ').reverse().join(' ');
    access = access.replace(/[ ]/g, ', ');
    accessToList.push(access);

    const accessLocations = await this.formatLocations(accessToList);
    const final_access = (accessLocations !== null) ? accessLocations : 'No Access';

    const { body } = req;
    const obj = {
      old: occupantBeforeCheckIn,
      new: occupantCheckIn.occupantCheckInObj[1],
      jobId: occupantCheckIn.occupantCheckInObj.jobId,
    };
    const placeholdersData = {
      access_to: final_access,
      receiverList: [{ email: occupantData.email }],
    };
    ActivityLogs.addActivityLog(Entities.occupant.entity_name,
      Entities.occupant.event_name.check_in, obj, Entities.notes.event_name.updated, occupantId,
      body.company_id, req.user_id, occupantId, placeholdersData);

    return occupantCheckIn;
  }

  static async editOccupants(req) {
    const oldObj = {};
    const newObj = {};
    const id = req.occupant_id;
    const occupantId = id;
    const companyId = req.body.company_id;

    const awsDetails = await getAWSDetailsFromCompanyId(companyId);
    const credsPath = await createAWSCredentialPath(companyId);
    const getOccupantDetails = await database.occupants.findOne({
      where: { id },
      raw: true
    });
    const { email } = getOccupantDetails;
    let first_name = req.body.first_name
    if (req.body.identity_id != undefined) {
      delete req.body.identity_id
    }
    if (req.body.id != undefined) {
      delete req.body.id
    }
    if (req.body.cognito_id != undefined) {
      delete req.body.cognito_id
    }
    if (first_name != undefined) {
      delete req.body.first_name
    }
    let last_name = req.body.last_name
    if (last_name != undefined) {
      delete req.body.last_name
    }
    let email1 = req.body.email
    if (email1 != undefined) {
      delete req.body.email
    }
    if (req.body.attributes) {
      let email2 = req.body.attributes.email
      if (email2 != undefined) {
        delete req.body.attributes.email
      }
      AWS.config.loadFromPath(credsPath);
      const attr = Object.keys(req.body.attributes).map((key) => {
        const attrDict = {};
        let new_key = null;
        if (key === 'first_name') {
          new_key = 'name';
          attrDict.Name = new_key;
          attrDict.Value = req.body.attributes[key];
          return attrDict;
        }
        if (key === 'last_name') {
          new_key = 'family_name';
          attrDict.Name = new_key;
          attrDict.Value = req.body.attributes[key];
          return attrDict;
        }
        if (key === 'phone_number' && req.body.attributes[key] === null) {
          attrDict.Name = key;
          attrDict.Value = "";
          return attrDict;
        }
        attrDict.Name = key;
        attrDict.Value = req.body.attributes[key];
        return attrDict;
      });
      const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
        apiVersion: '2016-04-18',
      });
      await cognitoidentityserviceprovider.adminUpdateUserAttributes(
        {
          UserAttributes: attr,
          UserPoolId: `${awsDetails.userPoolId}`,
          Username: email,
        },
        (err, data) => {
          if (err) {
            return null;
          }
          return data;
        },
      );
      const params = {
        UserPoolId: `${awsDetails.userPoolId}`,
        Username: email,
      };
      await cognitoidentityserviceprovider.adminGetUser(params, (err, data) => {
        if (err) {
          return null;
        }
        return data;
      });
    }
    const inputObj = { ...req.body };
    delete inputObj.attributes;
    delete inputObj.metadata;

    const combinedInputObj = { ...inputObj, ...req.body.attributes };
    if (combinedInputObj.locale) {
      combinedInputObj.language = combinedInputObj.locale
      delete combinedInputObj.locale;
    }
    await database.occupants.update(combinedInputObj, {
      where: { id },
      returning: true,
      plain: true,
    }).then((result) => result).catch((err) => {
      throw err;
    });

    if (req.body.metadata) {
      await this.updateOccupantMetadata(req.body.metadata, id, occupantId, companyId, req.user_id)
        .catch((err) => {
          throw err;
        });
    }
    const getEditedOccupantDetails = await database.occupants.findOne({
      where: { id },
      raw: true
    });
    Object.keys(getEditedOccupantDetails).forEach((key) => {
      if (getOccupantDetails[key] != getEditedOccupantDetails[key]) {
        oldObj[key] = getOccupantDetails[key];
        newObj[key] = getEditedOccupantDetails[key];
      }
    });
    const obj = {
      old: oldObj,
      new: newObj,
    };
    ActivityLogs.addActivityLog(Entities.occupant.entity_name, Entities.occupant.event_name.updated,
      obj, Entities.notes.event_name.updated, occupantId, companyId, req.user_id, occupantId);

    const updateOccupant = await this.getOccupantProfile(occupantId, companyId);
    return updateOccupant;
  }

  static async publishDeviceProperty(company_id, device_code, property, property_value, check_property) {
    var params = {
      thingName: device_code, /* required */
    };
    const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
    if (!shadowData) {
      // gateway shadow not updated
      // const err = ErrorCodes['330005'];
      // throw err;
      return { success: false };
    }
    var payload = JSON.parse(shadowData.payload);
    let base_key = null;
    const { reported } = payload.state; // array
    let base = null;
    if (!reported) {
      return { success: false };
    }
    let is_property_present = false
    Object.keys(reported).forEach((key) => {
      if (reported[key].hasOwnProperty('properties')) {
        const { properties } = reported[key];
        base_key = key;
        if (Object.keys(properties).length > 0) {
          base = Object.keys(properties)[0];
        }
        Object.keys(properties).forEach((key) => {
          let baseSplitArray = base.split(':');
          let property_key = `${baseSplitArray[0]}${check_property}`;
          if (key == property_key) {
            // console.log("🚀 ~ file: OccupantService.js:1332 ~ Object.keys ~ property_key:", property_key, key)
            is_property_present = true
          }
        })
      }
    });
    console.log("🚀 ~ file: OccupantService.js:1336 ~ Object.keys ~ property_key:", is_property_present, device_code)
    if (is_property_present == false) {
      return { success: false };
    }
    if (!base) {
      // const err = ErrorCodes['330005'];
      // throw err;
      return { success: false };
    } else {
      const baseSplitArray = base.split(':');
      const setProperty = `${baseSplitArray[0]}${property}`;
      var payload = {
        state:
        {
          desired: {},
        },
      };
      payload.state.desired[base_key] = {
        properties:
          {},
      };

      payload.state.desired[base_key].properties[setProperty] = property_value;

      const topic = `$aws/things/${device_code}/shadow/update`;
      var params = {
        topic,
        payload: JSON.stringify(payload),
      };

      const publishShadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'publish').then((data) => data);
      if (!publishShadowData) {
        // not published the url
        const err = ErrorCodes['800021'];
        throw err;
      }
      return { success: true };
    }
  }


  static async updateOccupantMetadata(metadata, id, occupantId, companyId, userId) {
    const keys = Object.keys(metadata);
    for (const key of keys) {
      let value = metadata[key];
      if (value) {
        value = value.toString();
      }
      const getMetaData = await database.occupants_metadata.findOne({
        where: {
          key,
          occupant_id: id,
        },
        raw: true,
      }).catch((err) => {
        throw (err);
      });
      if (getMetaData) {
        const update = {
          key,
          value,
        };
        const updateMetaData = await database.occupants_metadata.update(update, {
          where: {
            id: getMetaData.id,
          },
          returning: true,
          raw: true,
        }).then((result) => result).catch((err) => {
          throw (err);
        });
        //get company object
        var company = await getCompany(companyId).then(result => {
          return (result);
        }).catch((error) => {
          console.log(err);
          throw (error);
        });
        if (!company) {
          const err = ErrorCodes['000001'];
          throw (err);
        }
        if (company.configs && company.configs.global_setting_enable) {
          let constant = {
            "global_temperature_display_mode": {
              "setProperty": ":sIT600TH:SetTemperatureDisplayMode",
              "property": ":sIT600TH:TemperatureDisplayMode"
            },
            "global_time_format_24_hour": {
              "setProperty": ":sIT600TH:SetTimeFormat24Hour",
              "property": ":sIT600TH:TimeFormat24Hour"
            }
          }
          if (constant.hasOwnProperty(key)) {
            let gatewayList = await this.getOccupantSliderGateways(id, companyId).catch(err => {
              throw err
            })
            if (gatewayList && gatewayList.length > 0) {
              let gatewayPromiseList = []
              for (const index in gatewayList) {

                let publishGatewayDevices = async function (publishDeviceProperty) {
                  let gateway = gatewayList[index];
                  let devices = await database.devices.findAll({
                    where: {
                      gateway_id: gateway.id
                    }
                  }).catch((err) => {
                    throw (err);
                  });

                  if (devices && devices.length > 0) {
                    let promiseList = []
                    for (const id in devices) {
                      let device = devices[id];
                      if (device.type != "coordinator_device" && [1, 0, "1", "0"].includes(value)) {
                        var device_code = device.device_code
                        promiseList.push(publishDeviceProperty(companyId, device_code, constant[key].setProperty, parseInt(value), constant[key].property))
                      }
                    }
                    if (promiseList.length > 0) {
                      await Promise.all(promiseList).then((results) => {
                        return results
                      }).catch(error => {
                        // const err = ErrorCodes['160033'];
                        throw error;
                      });

                    }

                  }

                }
                gatewayPromiseList.push(publishGatewayDevices(this.publishDeviceProperty))

              }
              if (gatewayPromiseList.length > 0) {
                await Promise.all(gatewayPromiseList).then((results) => {
                  return results
                }).catch(error => {
                  throw error;
                });

              }
            }
          }
        }
        if (updateMetaData) {
          const updatedData = await database.occupants_metadata.findOne({
            where: {
              id: getMetaData.id,
            },
            raw: true,
          }).catch((err) => {
            throw (err);
          });
          let objOld = {};
          let objNew = {};
          const getUpdatedMetaData = await database.occupants_metadata.findOne({
            where: {
              key,
              occupant_id: id,
            },
            raw: true,
          }).catch((err) => {
            throw (err);
          });
          objOld = getMetaData;
          objNew = getUpdatedMetaData;
          const obj = {
            old: objOld,
            new: objNew,
          };
          const deletedExistingData = { ...getMetaData };
          delete deletedExistingData.updated_at;
          const deletedAfterUpdate = updatedData;
          delete deletedAfterUpdate.updated_at;
          if (JSON.stringify(deletedExistingData) !== JSON.stringify(deletedAfterUpdate)) {
            ActivityLogs.addActivityLog(Entities.occupants_metadata.entity_name, Entities.occupants_metadata.event_name.updated,
              obj, Entities.notes.event_name.updated, occupantId, companyId, userId, occupantId);
          }
        }
      } else {
        const addMetaData = await database.occupants_metadata.create({
          key,
          value,
          occupant_id: id,
        }).then((result) => result).catch((err) => {
          throw (err);
        });
        if (addMetaData) {
          const obj = {
            old: {},
            new: addMetaData,
          };
          ActivityLogs.addActivityLog(Entities.occupants_metadata.entity_name, Entities.occupants_metadata.event_name.added,
            obj, Entities.notes.event_name.added, occupantId, companyId, userId, occupantId);
        }
      }
    }
  }

  static async verifycheckedIn(id) {
    const checkedInLocations = await database.occupants_locations.count(
      {
        where: { occupant_id: id, status: Entities.occupant.event_name.status_checkin },
        order: [['updated_at', 'DESC']],
      },
    );
    if (checkedInLocations > 0) {
      const err = ErrorCodes['160019'];
      throw err;
    }
    return checkedInLocations;
  }

  static async verifyGatewayPresence(userData) {
    let gatewayIdList = [];
    if (userData && userData.Items && userData.Items.length > 0) {
      gatewayIdList = await OccupantDashboardService.getGatewayIdList(userData) || [];
    }
    const gatewayList = [];
    if (gatewayIdList.length > 0) {
      for (const key in gatewayIdList) {
        const gatewayId = gatewayIdList[key];
        const splitArr = gatewayId.split('-');
        if (splitArr && splitArr.length == 2) {
          const obj = {
            gatewayId,
            devicesIds: [],
          };
          gatewayList.push(obj);
        }
      }
      if (gatewayList.length > 0) {
        const err = ErrorCodes['160020'];
        throw err;
      }
    }
    return gatewayList;
  }

  static async deleteConfirmation(req, id) {
    const OccupantToDelete = await database.occupants.findOne({ where: { id } })
      .catch((err) => {
        throw (err);
      });
    if (OccupantToDelete) {
      const { identity_id } = OccupantToDelete;
      const userData = await OccupantDashboardService.getUserData(identity_id);
      await this.verifycheckedIn(id);
      await this.verifyGatewayPresence(userData);
      return { message: Responses.responses.occupant_delete_confirmation };
    }
    return null;
  }

  static async deleteOccupantCognito(userName, company) {
    return new Promise(async (resolve, reject) => {
      const userPoolId = company.aws_cognito_user_pool;
      const region = company.aws_region;
      AWS.config.update({
        region: company.aws_region,
        accessKeyId: company.aws_iam_access_key,
        secretAccessKey: company.aws_iam_access_secret,
      });
      const cognitoIdentity = new AWS.CognitoIdentityServiceProvider({ region });
      const deleteParams = {
        Username: userName,
        UserPoolId: userPoolId,
      };
      try {
        const result = await cognitoIdentity.adminDeleteUser(deleteParams).promise();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async deleteOccupant(req, id, email) {
    const companyId = req.body.company_id;
    const createdBy = req.user_id;
    const updatedBy = req.user_id;
    const userId = req.user_id;
    if (req.user_id) {
      const query = {
        companyId,
        userId: req.user_id,
      };
      const checkDeviceAccess = await CheckAllDeviceAccess(query);
      if (checkDeviceAccess !== true) {
        const err = ErrorCodes['160015'];
        throw err;
      }
    } let whereOccupant = { id }
    if (email) {
      whereOccupant = { email }
    }
    const OccupantToDelete = await database.occupants.findOne({ where: whereOccupant });
    if (OccupantToDelete) {
      const input = {
        occupantId: OccupantToDelete.id,
        userId: req.user_id,
        email: OccupantToDelete.email,
        userName: OccupantToDelete.first_name,
        userIdentityId: OccupantToDelete.identity_id,
        adminIdentityId: req.body.admin_identity_id,
      };
      const headerParams = {
        Authorization: req.headers['x-access-token'],
      };
      const userFormObj = {
        UserID: OccupantToDelete.identity_id,
        Username: OccupantToDelete.email,
        Command: DPCommands.removeUser,
      };
      await DeviceProvisionService.deviceProvison(headerParams, userFormObj, 0)
        .catch(() => {
          const err = ErrorCodes['380001'];
          throw err;
        });
      // const company = await getCompany(companyId).then(result => {
      //   return (result);  
      // }).catch((error) => {
      //   throw (error);
      // });
      // await this.deleteOccupantCognito(OccupantToDelete.email, company)
      //   .catch((error) => {
      //     const err = ErrorCodes['900012'];
      //     throw err;
      //   });

      const jobObj = {};
      const appendObj = {
        OccupantToDeleteObj: OccupantToDelete,
      };
      const Obj = {
        old: appendObj,
        new: {},
      };
      ActivityLogs.addActivityLog(Entities.occupant.entity_name,
        Entities.occupant.event_name.delete_job,
        Obj, Entities.notes.event_name.added, OccupantToDelete.id, companyId, userId, OccupantToDelete.id, null);

      jobObj.message = Responses.responses.occupant_delete_job_message;
      return (jobObj);
    }

    return null;
  }

  static async getInviteId(inviteCode) {
    const invite = await database.occupants_invitations.findOne({
      where: {
        invite_code: inviteCode,
      },
    }).catch((err) => {
      throw (err);
    });

    return invite;
  }

  static async occupantCheckIn(req) {
    const OccupantLocation = await OccupantLocationsService.occupantCheckIn(req);
    return OccupantLocation;
  }

  static async occupantCheckOut(req) {
    const OccupantLocation = await OccupantLocationsService.occupantCheckOut(req);
    return OccupantLocation;
  }

  static async getOccupantLocationAddress(req) {
    const occupant_address = [];
    const occupant_location = await database.occupants_locations.findAll({
      where: {
        occupant_id: req.occupant_id,
        status: Entities.occupant.event_name.status_checkin,
      },
    });
    if (occupant_location && occupant_location.length > 0) {
      for (const key in occupant_location) {
        const locations = occupant_location[key];
        const location = await database.locations.findOne({
          include: [
            {
              model: database.addresses,
              as: 'address',
            },
          ],
          where: { id: locations.location_id },
          raw: true,
          nest: true,
        });
        let address = location.path.breadcrumb;
        address = address.replace(/[/]/g, ', ');
        address = address.substring(2);
        occupant_address.push(address);
      }
    }
    return occupant_address;
  }

  static async getCognitoIdFromOccupants(occupantsDetails) {
    const { cognitoId, companyId } = occupantsDetails;
    const occupants = await database.occupants.findOne({
      where: {
        cognito_id: cognitoId,
        // company_id: companyId,
      },
    }).catch((err) => {
      throw err;
    });
    return occupants;
  }

  static async createOccupant(email, cognito_id, company_id, identity_id) {
    const filter = `sub = "${cognito_id}"`;
    const occupantDetails = await userService.getUserCredentials(
      filter, company_id,
    ).catch((err) => {
      throw err;
    });
    let phoneNumber = null;
    let first_name = null;
    let last_name = null;
    let language = 'en';
    let country = 'us';

    if (occupantDetails && occupantDetails.length > 0) {
      const nameObj = lodash.filter(occupantDetails[0].Attributes, [
        'Name',
        'name',
      ]);
      const phoneNumberObj = lodash.filter(occupantDetails[0].Attributes, [
        'Name',
        'phone_number',
      ]);
      const lastNameObj = lodash.filter(occupantDetails[0].Attributes, [
        'Name',
        'family_name',
      ]);
      const languageObj = lodash.filter(occupantDetails[0].Attributes, [
        'Name',
        'locale',
      ]);
      if (phoneNumberObj.length > 0) {
        phoneNumber = phoneNumberObj[0].Value;
      }
      if (nameObj.length > 0) {
        first_name = nameObj[0].Value;
      } else {
        first_name = 'default'
      }
      if (lastNameObj.length > 0) {
        last_name = lastNameObj[0].Value;
      } else {
        last_name = 'default'
      }
      if (languageObj.length > 0) {
        language = languageObj[0].Value;
      }

      const occupants = await database.occupants.create({
        email,
        company_id,
        cognito_id,
        identity_id,
        first_name,
        phone_number: phoneNumber,
        last_name,
        language,
        country
      }).catch((err) => {
        throw (err);
      });
      return occupants;
    }
  }

  static async getlinkedCompanies(company_id) {
    // get company data from cache if not present set
    const company = await getCompany(company_id).then(result => {
      return (result);
    }).catch((error) => {
      throw (error);
    });
    if (!company) {
      const err = ErrorCodes['000001']; // company not found
      throw err;
    }
    let linkedCompanies = [];
    if (company.linked_companies) {
      linkedCompanies = company.linked_companies.split(',');
    }
    linkedCompanies.push(company.code);
    const companies = await database.companies.findAll({
      where: { code: { [Op.in]: linkedCompanies } },
    });
    linkedCompanies = lodash.map(companies, 'id');
    return linkedCompanies;
  }
  static customSort(a, b) {
    // Handle undefined values (move them to the end)
    if (a.gateway.name === undefined) {
      return 1;
    }
    if (b.gateway.name === undefined) {
      return -1;
    }

    // Check for special characters
    const isSpecialCharA = /[!@#$%^&*()+\\|;':",./<>?`{}~]/.test(a.gateway.name);
    const isSpecialCharB = /[!@#$%^&*()+\\|;':",./<>?`{}~]/.test(b.gateway.name);
    if (isSpecialCharA !== isSpecialCharB) {
      return isSpecialCharB - isSpecialCharA; // Special characters first
    }

    // Check for numbers
    const isNumberA = !isNaN(Number(a.gateway.name));
    const isNumberB = !isNaN(Number(b.gateway.name));
    if (isNumberA !== isNumberB) {
      return isNumberB - isNumberA; // Numbers second
    }

    // Alphabetical order (case-insensitive) for remaining elements
    return a.gateway.name.localeCompare(b.gateway.name, 'en', { sensitivity: 'case' });
  }
  // get slider list
  static async getOccupantSliderGateways(occupant_id, company_id) {
    return new Promise(async (resolve, reject) => {
      const company = await getCompany(company_id).then(result => {
        return (result);
      }).catch((error) => {
        throw (error);
      });
      if (!company) {
        const err = ErrorCodes['000001']; // company not found
        throw err;
      }
      const linkedCompanies = await this.getlinkedCompanies(company_id)
        .catch((error) => {
          throw (error);
        });
      const gatewayIdList = await database.occupants_permissions.findAll({
        where: {
          [Op.or]: [
            {
              receiver_occupant_id: occupant_id,
              is_temp_access: false,
            },
            {
              receiver_occupant_id: occupant_id,
              end_time: {
                [Op.gte]: moment().toDate(),
              },
              start_time: {
                [Op.lte]: moment().toDate(),
              },
              is_temp_access: true,
            },
          ],
          company_id: { [Op.in]: linkedCompanies },
        },
      }).then((gateways) => {
        // console.log("🚀  file: OccupantService.js  line 1002  OccupantService  returnnewPromise ~ gateways", gateways.dataValues)
        const gatewayIdList = [];
        gateways.forEach((element) => {
          gatewayIdList.push(element.gateway_id);
        });
        return gatewayIdList;
      }).catch((err) => {
        Logger.error('error', err);
        reject(err);
      });
      if (!gatewayIdList && gatewayIdList.length < 1) {
        resolve([]);
      }
      const gateways = await database.devices.findAll({
        attributes: ['id', 'type', 'device_code', 'model', 'name', 'plan_code'],
        include: [
          {
            required: false,
            attributes: ['id', 'device_id', 'key', 'value'],
            model: database.devices_metadata,
          },
          {
            required: false,
            attributes: ['name', 'category_id'],
            model: database.categories,
            as: 'category',
          },
          {
            required: true,
            model: database.occupants_permissions,
            include: [{
              attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number', 'identity_id', 'cognito_id'],
              model: database.occupants,
              as: 'receiver_occupant',
            },
            {
              attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number', 'identity_id', 'cognito_id'],
              model: database.occupants,
              as: 'sharer_occupant',
            },
            ],
            where: {
              receiver_occupant_id: occupant_id,
            },
          }, {
            required: false,
            attributes: ['id', 'device_code', 'name', 'model'],
            include: [{
              required: false,
              attributes: ['name', 'category_id'],
              model: database.categories,
              as: 'category',
            }],
            model: database.devices,
            where: {
              type: 'coordinator_device',
              is_manually_added: true
            },
            as: 'coordinator_device',
          },
          {
            required: false,
            model: database.rule_groups,
            as: 'rule_group',
          },
          {
            required: false,
            model: database.devices,
            as: 'gateway_devices'
          },
        ],
        where: {
          id: {
            [Op.in]: gatewayIdList,
          },
        },
        order: [['created_at', 'asc']],
      }).then((result) => {
        if (!result || result.length == 0) {
          return [];
        }
        let formatedGateways = [];
        for (const gateway of result) {
          const obj = {
            id: gateway.id, type: gateway.type,
          };
          let device_count = gateway.gateway_devices.length
          if (device_count > 0) {
            device_count = gateway.gateway_devices.length - 1
          }
          obj.gateway = {
            id: gateway.id, device_code: gateway.device_code, category: gateway.category, model: gateway.model, name: gateway.name, plan_code: gateway.plan_code, occupants_permissions: gateway.occupants_permissions[0], coordinator_device: gateway.coordinator_device, rule_group: gateway.rule_group, device_count: device_count
          };
          formatedGateways.push(obj);
        }
        if (company && company.configs && company.configs.gateway_sort_order_on_name == true) {
          formatedGateways = lodash.sortBy(formatedGateways, function (item) {
            if (item.gateway.name !== undefined && item.gateway.name !== null) {
              return item.gateway.name.toLowerCase();
            } else {
              return "";
            }
          })
        }
        return formatedGateways;
      }).catch((err) => {
        Logger.error('error', err);
        reject(err);
      });
      resolve(gateways);
    });
  }

  static async getOccupantSliderSharedLocations(occupant_id, company_id) {
    return new Promise(async (resolve, reject) => {
      const linkedCompanies = await this.getlinkedCompanies(company_id)
        .catch((error) => {
          throw (error);
        });
      const locations = await database.occupants_locations.findAll({
        attributes: ['id'],
        include: [
          {
            required: false,
            attributes: ['id', 'name', 'notes'],
            model: database.locations,
            as: 'location',
            include: [{
              required: false,
              attributes: { exclude: ['company_id', 'created_at', 'updated_at'] },
              model: database.addresses,
            }],
          },
        ],
        where: {
          occupant_id,
          status: 'checked in',
          company_id: { [Op.in]: linkedCompanies },
        },
      }).then((result) => {
        if (!result || result.length == 0) {
          return [];
        }
        const formatedLocations = [];
        for (const element of result) {
          const obj = element.dataValues;
          obj.type = 'location';
          formatedLocations.push(obj);
        }
        return formatedLocations;
      }).catch((err) => {
        Logger.error('error', err);
        reject(err);
      });
      resolve(locations);
    });
  }

  // get camera sliderlist
  static async getOccupantSliderCameras(occupant_id, company_id) {
    return new Promise(async (resolve, reject) => {
      const linkedCompanies = await this.getlinkedCompanies(company_id)
        .catch((error) => {
          throw (error);
        });
      const cameraDevicesList = await database.camera_devices.findAll({
        where: {
          occupant_id, company_id: { [Op.in]: linkedCompanies },
        },
      }).then((camera) => {
        let cameraDevicesList = [];
        camera.forEach((element) => {
          if (element.gateway_id == null || !element.gateway_id) {
            cameraDevicesList.push(element);
          }
        });
        return cameraDevicesList;
      }).catch((err) => {
        Logger.error('error 1708:', err);
        reject(err);
      });

      if (cameraDevicesList && cameraDevicesList.length < 1) {
        // Logger.error('logger 1713:');
        resolve([]);
      }
      let formattedCamera = [];
      const obj = {
        id: occupant_id, type: 'camera_dashboard',
      };
      if (cameraDevicesList && cameraDevicesList.length > 0) {
        for (const key in cameraDevicesList) {
          // using below code later for primary camera display
          // obj.camera = [];
          // const element = cameraDevicesList[key];
          // console.log("element of camera_id:", element.camera_id);
          // console.log("element of formatedCameras:", element);

          // // put here for cameras
          // let items = {
          //   id: element.id, name: element.name, type: element.type, camera_id: element.camera_id, gateway_id: element.gateway_id, company_id: element.company_id, occupant_id: element.occupant_id
          // };
          // obj.camera.push(items);
        }
        formattedCamera.push(obj);
        resolve(formattedCamera);
      }
    });
  }

  static async getOccupantSliderList(occupant_id, company_id) {
    return new Promise(async (resolve, reject) => {
      const [gatewayList, locationList, cameraList] = await Promise.all([this.getOccupantSliderGateways(occupant_id, company_id), this.getOccupantSliderSharedLocations(occupant_id, company_id), this.getOccupantSliderCameras(occupant_id, company_id)]).catch((err) => {
        Logger.error('error', err);
        const error = ErrorCodes['340001'];
        reject(error);
      });
      const dashboard = [...gatewayList, ...locationList, ...cameraList];
      resolve(dashboard);
    });
  }

  // get slider gateway details/list
  static async sorting() {
    (Account.Order.Product, function ($l, $r) {
      $l.Description.Weight > $r.Description.Weight;
    });
  }

  static async getOccupantGatewayConfiguration(gateway_id, occupant_id, company_id) {
    const linkedCompanies = await this.getlinkedCompanies(company_id)
      .catch((error) => {
        throw (error);
      });
    const gateway = await database.devices.findOne({
      attributes: ['id', 'type', 'device_code', 'model', 'name', 'plan_code',],
      include: [
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
            type: {
              [Op.ne]: 'protection_status'
            }
          },
          as: 'dashboard_attributes',
        },
        {
          required: false,
          attributes: ['key', 'value'],
          model: database.devices_metadata,
        },
        {
          required: false,
          model: database.occupants_permissions,
          include: [{
            attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number', 'identity_id', 'cognito_id'],
            model: database.occupants,
            as: 'receiver_occupant',
          },
          {
            attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number', 'identity_id', 'cognito_id'],
            model: database.occupants,
            as: 'sharer_occupant',
          },
          ],
          where: {
            receiver_occupant_id: occupant_id,
          },
        },
        {
          required: false,
          attributes: ['name', 'category_id'],
          model: database.categories,
          as: 'category',
        },
        {
          required: false,
          attributes: ['id', 'device_code', 'name', 'model'],
          include: [{
            required: false,
            attributes: ['name', 'category_id'],
            model: database.categories,
            as: 'category',
          }],
          model: database.devices,
          where: {
            type: 'coordinator_device',
            is_manually_added: true
          },
          as: 'coordinator_device',
        },
        {
          required: false,
          model: database.alert_communication_configs,
          where: {
            occupant_id,
          },
        },
        {
          required: false,
          model: database.rule_groups,
          as: 'rule_group',
        },
      ],
      where: {
        id: gateway_id,
        company_id: { [Op.in]: linkedCompanies },
      },
    }).catch((err) => { console.log(err); });
    return gateway;
  }

  static async getOccupantDevicesConfigurations(gateway_id, occupant_id, company_id) {
    const linkedCompanies = await this.getlinkedCompanies(company_id)
      .catch((error) => {
        throw (error);
      });
    const groupedDevices = await database.occupants_groups_devices.findAll({
      include: [
        {
          required: true,
          model: database.occupants_groups,
          where: {
            item_id: gateway_id,
            occupant_id,
          },
        },
      ],
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const groupedDeviceList = [];
      for (const iterator of result) {
        groupedDeviceList.push(iterator.device_id);
      }
      return groupedDeviceList;
    }).catch((err) => {
      throw err;
    });
    const devices = await database.devices.findAll({
      attributes: ['id', 'device_code', 'name', 'model'],
      model: database.devices,
      include: [
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
          },
          as: 'dashboard_attributes',
        },
        {
          required: false,
          attributes: ['key', 'value'],
          model: database.devices_metadata,
        }, {
          required: false,
          attributes: ['name', 'category_id'],
          model: database.categories,
          as: 'category',
        }, {
          required: false,
          model: database.alert_communication_configs,
          where: {
            occupant_id,
          },
        }],
      where: {
        type: null,
        gateway_id,
        id: {
          [Op.notIn]: groupedDevices,
        },
        company_id: { [Op.in]: linkedCompanies },
        is_manually_added: true,
      },
    })
      .then((result) => {
        if (!result || result.length == 0) {
          return [];
        }
        const deviceList = [];
        for (const element of result) {
          const deviceObj = element.dataValues;
          if (!element.dashboard_attributes) {
            deviceObj.dashboard_attributes = {
              type: 'device',
            };
          }
          deviceList.push(deviceObj);
        }
        return deviceList;
      })
      .catch((err) => {
        throw err;
      });
    return devices;
  }

  static async getOccupantGroupsConfigurations(gateway_id, occupant_id, company_id) {
    const linkedCompanies = await this.getlinkedCompanies(company_id)
      .catch((error) => {
        throw (error);
      });
    const devices = await database.occupants_groups.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          attributes: ['id'],
          required: false,
          model: database.occupants_groups_devices,
          include: [{
            attributes: ['id', 'device_code', 'name', 'model', 'type'],
            model: database.devices,
            include: [{
              required: false,
              attributes: ['name', 'category_id'],
              model: database.categories,
              as: 'category',
            }, {
              required: false,
              attributes: ['id', 'type', 'grid_order'],
              model: database.occupants_dashboard_attributes,
              where: {
                occupant_id,
              },
              as: 'dashboard_attributes',
            }, {
              required: false,
              model: database.alert_communication_configs,
              where: {
                occupant_id,
              },
            }],
            where: {
              is_manually_added: true,
            },
          }],
          as: 'devices',
        },
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
          },
          as: 'dashboard_attributes',
        },
      ],
      where: {
        occupant_id, item_id: gateway_id, company_id: { [Op.in]: linkedCompanies },
      },
    }).then(async (result) => {
      if (!result || result.length == 0) {
        return [];
      }

      const formatedLocations = [];
      for (const group of result) {
        const obj = group.dataValues;
        if (!obj.dashboard_attributes) {
          obj.dashboard_attributes = {
            type: 'group',
          };
        }
        if (group.devices) {
          obj.items = [];
          for (const element of group.devices) {
            const deviceObj = element.device.dataValues;
            deviceObj.group_device_id = element.id;
            // deviceObj.dashboard_attributes = element.dashboard_attributes;
            if (deviceObj.type == 'gateway') {
              const gateway = await this.getOccupantGatewayConfiguration(gateway_id, occupant_id, company_id);
              if (!gateway.dashboard_attributes) {
                gateway.dataValues.dashboard_attributes = {
                  type: 'gateway',
                };
              }
              const occupantsPermissions = gateway.occupants_permissions[0];
              delete gateway.dataValues.occupants_permissions;
              delete gateway.dataValues.type;
              gateway.dataValues.occupants_permissions = occupantsPermissions;

              obj.items.push(gateway);
            } else {
              if (!deviceObj.dashboard_attributes) {
                deviceObj.dashboard_attributes = {
                  type: 'device',
                };
              }
              deviceObj.category = element.device.category;
              obj.items.push(deviceObj);
            }
          }
        }
        delete obj.devices;
        formatedLocations.push(obj);
      }
      return formatedLocations;
    });
    return devices;
  }

  static async getOnetouchRuleConfigurations(gateway_id, occupant_id, company_id) {
    const linkedCompanies = await this.getlinkedCompanies(company_id)
      .catch((error) => {
        throw (error);
      });
    const oneTouchRules = await database.one_touch_rules.findAll({
      attributes: ['id', 'rule_trigger_key', 'rule'],
      include: [
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          as: 'dashboard_attributes',
          where: {
            occupant_id,
          },
        },
      ],
      where: {
        gateway_id, company_id: { [Op.in]: linkedCompanies },
      },
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const oneTouchRuleList = [];
      for (const element of result) {
        const oneTouchRuleObj = element.dataValues;
        if (!element.dashboard_attributes) {
          oneTouchRuleObj.dashboard_attributes = {
            type: 'one_touch_rule',
          };
        }
        oneTouchRuleList.push(oneTouchRuleObj);
      }
      return oneTouchRuleList;
    });
    return oneTouchRules;
  }

  static async getProtectionStatusDetails(gateway_id, occupant_id, company_id) {
    const linkedCompanies = await this.getlinkedCompanies(company_id)
      .catch((error) => {
        throw (error);
      });
    const protectionStatus = await database.occupants_dashboard_attributes.findAll({
      attributes: ['id', 'type', 'grid_order'],
      where: {
        item_id: gateway_id, occupant_id, type: 'protection_status', company_id: { [Op.in]: linkedCompanies },
      },
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const protectionStatusList = [];
      for (const element of result) {
        let protectionStatusObj = {};
        protectionStatusObj.id = gateway_id;
        protectionStatusObj.dashboard_attributes = element.dataValues;
        protectionStatusList.push(protectionStatusObj);
      }
      return protectionStatusList;
    });
    return protectionStatus;
  }
  static async getAdminSliderGatewayDetails(gateway_code, req_occupant_id, company_id) {
    const gatewayExist = await database.devices.findOne({
      where: {
        device_code: gateway_code,
      },
      raw: true,
    });
    if (!gatewayExist) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    const occupantExist = await database.occupants.findOne({
      where: {
        id: req_occupant_id,
      },
      raw: true,
    });
    if (!occupantExist) {
      const err = ErrorCodes['160010'];
      throw err;
    }
    let gateway_id = gatewayExist.id
    let occupant_id = req_occupant_id
    const [gateway, devices, groups, oneTouchRules, protectionStatus] = await Promise.all([this.getOccupantGatewayConfiguration(gateway_id, occupant_id, company_id), this.getOccupantDevicesConfigurations(gateway_id, occupant_id, company_id), this.getOccupantGroupsConfigurations(gateway_id, occupant_id, company_id), this.getOnetouchRuleConfigurations(gateway_id, occupant_id, company_id), this.getProtectionStatusDetails(gateway_id, occupant_id, company_id)]);
    if (gateway) {
      const isHavePermission = await database.occupants_permissions.findOne({
        where: {
          receiver_occupant_id: occupant_id,
          gateway_id: gateway.id,
        },
      });
      if (!isHavePermission) {
        const err = ErrorCodes['160045'];
        throw err;
      }

      let gatewayCamera = [];
      // check whether the occupant is a actual owner or F/G
      if (isHavePermission.access_level == 'O' && (isHavePermission.receiver_occupant_id == isHavePermission.sharer_occupant_id)) {
        // camera_devices data for its own gateway
        const cameraDevicesOwn = await database.camera_devices.findAll({
          where: {
            gateway_id: gateway.id, occupant_id: occupant_id,
          },
        }).then((data) => {
          return data;
        }).catch((err) => {
          Logger.error('error 2086:', err);
          throw (err);
        });

        // if occupant permission is present then check camera assigned to that gateway permission
        // find all where this occ_per_id present in occ_cam_per table
        let occupantCameraPermissions = await database.occupants_camera_permissions.findAll({
          where: {
            occupant_permission_id: isHavePermission.id,
          },
        }).then((result) => {
          let occupantsCameraPermissionsList = [];
          result.forEach((element) => {
            occupantsCameraPermissionsList.push(element.camera_device_id);
          });
          return occupantsCameraPermissionsList;
        }).catch((err) => {
          throw err;
        });
        // apply for and get one array
        if (cameraDevicesOwn && cameraDevicesOwn.length > 0) {
          for (const key in cameraDevicesOwn) {
            const element = cameraDevicesOwn[key];
            const camera_device_id = element.id;
            if (!occupantCameraPermissions.includes(camera_device_id)) {
              occupantCameraPermissions.push(camera_device_id);
            }
          }
        }

        if (occupantCameraPermissions && occupantCameraPermissions.length > 0) {
          let gatewayCameraObj = {
            id: gateway.id,
            name: "cameras",
            dashboard_attributes: { type: "camera_group" },
          }
          gatewayCameraObj.items = [];

          for (const key in occupantCameraPermissions) {
            const camera_device_id = occupantCameraPermissions[key];
            // search the camera record in camera_devices table
            const cameraDevicesData = await database.camera_devices.findOne({
              where: {
                id: camera_device_id,
              },
            }).then((data) => {
              return data;
            }).catch((err) => {
              Logger.error('error 2135:', err);
              throw (err);
            });
            //create object 
            if (cameraDevicesData) {
              // prepare object including dashboard_attributes
              // put here for Items
              let cameraItem = {
                id: cameraDevicesData.id, name: cameraDevicesData.name, type: cameraDevicesData.type, camera_id: cameraDevicesData.camera_id, gateway_id: cameraDevicesData.gateway_id,
                company_id: cameraDevicesData.company_id, occupant_id: cameraDevicesData.occupant_id, plan_code: cameraDevicesData.plan_code, dashboard_attributes: { type: "camera" }
              };
              gatewayCameraObj.items.push(cameraItem);
            }
          }
          gatewayCamera.push(gatewayCameraObj);
        }

      } else {
        // if (isHavePermission.access_level != 'O' && (isHavePermission.receiver_occupant_id != isHavePermission.sharer_occupant_id)) 
        // if occupant permission is present then check camera assigned to that gateway permission
        // find all where this occ_per_id present in occ_cam_per table
        const occupantCameraPermissions = await database.occupants_camera_permissions.findAll({
          where: {
            occupant_permission_id: isHavePermission.id,
          },
        }).then((result) => {
          return result;
        }).catch((err) => {
          throw err;
        });
        // if (occupantCameraPermissions && Object.keys(occupantCameraPermissions).length > 0) {
        if (occupantCameraPermissions && occupantCameraPermissions.length > 0) {
          let gatewayCameraObj = {
            id: gateway.id,
            name: "cameras",
            dashboard_attributes: { type: "camera_group" },
          }
          gatewayCameraObj.items = [];
          for (const key in occupantCameraPermissions) {
            const element = occupantCameraPermissions[key];
            const { camera_device_id } = element;
            // search the camera record in camera_devices table
            const cameraDevicesData = await database.camera_devices.findOne({
              where: {
                id: camera_device_id,
              },
            }).then((data) => {
              return data;
            }).catch((err) => {
              Logger.error('error 2185:', err);
              throw (err);
            });
            //create object 
            if (cameraDevicesData) {
              // prepare object including dashboard_attributes
              // put here for Items
              let cameraItem = {
                id: cameraDevicesData.id, name: cameraDevicesData.name, type: cameraDevicesData.type, camera_id: cameraDevicesData.camera_id, gateway_id: cameraDevicesData.gateway_id,
                company_id: cameraDevicesData.company_id, occupant_id: cameraDevicesData.occupant_id, plan_code: cameraDevicesData.plan_code, dashboard_attributes: { type: "camera" }
              };
              gatewayCameraObj.items.push(cameraItem);
            }
          }
          gatewayCamera.push(gatewayCameraObj);
        }
      }

      const obj = {
        id: gateway.id, type: gateway.type,
      };
      obj.gateway = {
        id: gateway.id, device_code: gateway.device_code, category: gateway.category, model: gateway.model, name: gateway.name, plan_code: gateway.plan_code, occupants_permissions: gateway.occupants_permissions[0], coordinator_device: gateway.coordinator_device, rule_group: gateway.rule_group,
      };
      if (!gateway.dashboard_attributes) {
        gateway.dataValues.dashboard_attributes = {
          type: 'gateway',
        };
      }
      const occupantsPermissions = gateway.occupants_permissions[0];
      delete gateway.dataValues.occupants_permissions;
      delete gateway.dataValues.type;
      gateway.dataValues.occupants_permissions = occupantsPermissions;
      const occupantGroupsCount = `SELECT COUNT(*) FROM occupants_groups_devices WHERE occupant_group_id IN
    (SELECT id  FROM occupants_groups WHERE item_id = :gateway_id  and occupant_id = :occupant_id)
    AND device_id = :gateway_id`;

      const groupCount = await database.sequelize.query(
        occupantGroupsCount,
        {
          raw: true,
          replacements: { gateway_id, company_id, occupant_id },
          logging: console.log,
        },
      );
      const welcome_tile = {
        dashboard_attributes: {
          type: 'welcome_tile',
        },
      };
      // if count >0 then dont push else push
      const groupCountStore = groupCount[0];
      if (groupCountStore[0].count < 1) {
        devices.unshift(gateway);
      }
      const items = [...devices, ...groups, ...oneTouchRules, ...gatewayCamera, ...protectionStatus];
      obj.items = lodash.sortBy(items, 'dashboard_attributes.grid_order');
      if (gateway && gateway.occupants_permissions && gateway.occupants_permissions.length > 0
        && gateway.occupants_permissions[0].dataValues.welcome_tile_enabled == true) {
        welcome_tile.id = gateway.occupants_permissions[0].dataValues.id;
        obj.items.unshift(welcome_tile);
      }
      return obj;
    }
    return {};
  }
  static async getSliderGatewayDetails(gateway_id, occupant_id, company_id) {
    const [gateway, devices, groups, oneTouchRules, protectionStatus] = await Promise.all([this.getOccupantGatewayConfiguration(gateway_id, occupant_id, company_id), this.getOccupantDevicesConfigurations(gateway_id, occupant_id, company_id), this.getOccupantGroupsConfigurations(gateway_id, occupant_id, company_id), this.getOnetouchRuleConfigurations(gateway_id, occupant_id, company_id), this.getProtectionStatusDetails(gateway_id, occupant_id, company_id)]);
    if (gateway) {
      const isHavePermission = await database.occupants_permissions.findOne({
        where: {
          receiver_occupant_id: occupant_id,
          gateway_id: gateway.id,
        },
      });
      if (!isHavePermission) {
        const err = ErrorCodes['160045'];
        throw err;
      }

      let gatewayCamera = [];
      // check whether the occupant is a actual owner or F/G
      if (isHavePermission.access_level == 'O' && (isHavePermission.receiver_occupant_id == isHavePermission.sharer_occupant_id)) {
        // camera_devices data for its own gateway
        const cameraDevicesOwn = await database.camera_devices.findAll({
          where: {
            gateway_id: gateway.id, occupant_id: occupant_id,
          },
        }).then((data) => {
          return data;
        }).catch((err) => {
          Logger.error('error 2086:', err);
          throw (err);
        });

        // if occupant permission is present then check camera assigned to that gateway permission
        // find all where this occ_per_id present in occ_cam_per table
        let occupantCameraPermissions = await database.occupants_camera_permissions.findAll({
          where: {
            occupant_permission_id: isHavePermission.id,
          },
        }).then((result) => {
          let occupantsCameraPermissionsList = [];
          result.forEach((element) => {
            occupantsCameraPermissionsList.push(element.camera_device_id);
          });
          return occupantsCameraPermissionsList;
        }).catch((err) => {
          throw err;
        });
        // apply for and get one array
        if (cameraDevicesOwn && cameraDevicesOwn.length > 0) {
          for (const key in cameraDevicesOwn) {
            const element = cameraDevicesOwn[key];
            const camera_device_id = element.id;
            if (!occupantCameraPermissions.includes(camera_device_id)) {
              occupantCameraPermissions.push(camera_device_id);
            }
          }
        }

        if (occupantCameraPermissions && occupantCameraPermissions.length > 0) {
          let gatewayCameraObj = {
            id: gateway.id,
            name: "cameras",
            dashboard_attributes: { type: "camera_group" },
          }
          gatewayCameraObj.items = [];

          for (const key in occupantCameraPermissions) {
            const camera_device_id = occupantCameraPermissions[key];
            // search the camera record in camera_devices table
            const cameraDevicesData = await database.camera_devices.findOne({
              where: {
                id: camera_device_id,
              },
            }).then((data) => {
              return data;
            }).catch((err) => {
              Logger.error('error 2135:', err);
              throw (err);
            });
            //create object 
            if (cameraDevicesData) {
              // prepare object including dashboard_attributes
              // put here for Items
              let cameraItem = {
                id: cameraDevicesData.id, name: cameraDevicesData.name, type: cameraDevicesData.type, camera_id: cameraDevicesData.camera_id, gateway_id: cameraDevicesData.gateway_id,
                company_id: cameraDevicesData.company_id, occupant_id: cameraDevicesData.occupant_id, plan_code: cameraDevicesData.plan_code, dashboard_attributes: { type: "camera" }
              };
              gatewayCameraObj.items.push(cameraItem);
            }
          }
          gatewayCamera.push(gatewayCameraObj);
        }

      } else {
        // if (isHavePermission.access_level != 'O' && (isHavePermission.receiver_occupant_id != isHavePermission.sharer_occupant_id)) 
        // if occupant permission is present then check camera assigned to that gateway permission
        // find all where this occ_per_id present in occ_cam_per table
        const occupantCameraPermissions = await database.occupants_camera_permissions.findAll({
          where: {
            occupant_permission_id: isHavePermission.id,
          },
        }).then((result) => {
          return result;
        }).catch((err) => {
          throw err;
        });
        // if (occupantCameraPermissions && Object.keys(occupantCameraPermissions).length > 0) {
        if (occupantCameraPermissions && occupantCameraPermissions.length > 0) {
          let gatewayCameraObj = {
            id: gateway.id,
            name: "cameras",
            dashboard_attributes: { type: "camera_group" },
          }
          gatewayCameraObj.items = [];
          for (const key in occupantCameraPermissions) {
            const element = occupantCameraPermissions[key];
            const { camera_device_id } = element;
            // search the camera record in camera_devices table
            const cameraDevicesData = await database.camera_devices.findOne({
              where: {
                id: camera_device_id,
              },
            }).then((data) => {
              return data;
            }).catch((err) => {
              Logger.error('error 2185:', err);
              throw (err);
            });
            //create object 
            if (cameraDevicesData) {
              // prepare object including dashboard_attributes
              // put here for Items
              let cameraItem = {
                id: cameraDevicesData.id, name: cameraDevicesData.name, type: cameraDevicesData.type, camera_id: cameraDevicesData.camera_id, gateway_id: cameraDevicesData.gateway_id,
                company_id: cameraDevicesData.company_id, occupant_id: cameraDevicesData.occupant_id, plan_code: cameraDevicesData.plan_code, dashboard_attributes: { type: "camera" }
              };
              gatewayCameraObj.items.push(cameraItem);
            }
          }
          gatewayCamera.push(gatewayCameraObj);
        }
      }

      const obj = {
        id: gateway.id, type: gateway.type,
      };
      obj.gateway = {
        id: gateway.id, device_code: gateway.device_code, category: gateway.category, model: gateway.model, name: gateway.name, plan_code: gateway.plan_code, occupants_permissions: gateway.occupants_permissions[0], coordinator_device: gateway.coordinator_device, rule_group: gateway.rule_group,
      };
      if (!gateway.dashboard_attributes) {
        gateway.dataValues.dashboard_attributes = {
          type: 'gateway',
        };
      }
      const occupantsPermissions = gateway.occupants_permissions[0];
      delete gateway.dataValues.occupants_permissions;
      delete gateway.dataValues.type;
      gateway.dataValues.occupants_permissions = occupantsPermissions;
      const occupantGroupsCount = `SELECT COUNT(*) FROM occupants_groups_devices WHERE occupant_group_id IN
    (SELECT id  FROM occupants_groups WHERE item_id = :gateway_id  and occupant_id = :occupant_id)
    AND device_id = :gateway_id`;

      const groupCount = await database.sequelize.query(
        occupantGroupsCount,
        {
          raw: true,
          replacements: { gateway_id, company_id, occupant_id },
          logging: console.log,
        },
      );
      const welcome_tile = {
        dashboard_attributes: {
          type: 'welcome_tile',
        },
      };
      // if count >0 then dont push else push
      const groupCountStore = groupCount[0];
      if (groupCountStore[0].count < 1) {
        devices.unshift(gateway);
      }
      const items = [...devices, ...groups, ...oneTouchRules, ...gatewayCamera, ...protectionStatus];
      obj.items = lodash.sortBy(items, 'dashboard_attributes.grid_order');
      if (gateway && gateway.occupants_permissions && gateway.occupants_permissions.length > 0
        && gateway.occupants_permissions[0].dataValues.welcome_tile_enabled == true) {
        welcome_tile.id = gateway.occupants_permissions[0].dataValues.id;
        obj.items.unshift(welcome_tile);
      }
      return obj;
    }
    return {};
  }

  static async getSliderCameraDetails(occupant_id, company_id) {
    return new Promise(async (resolve, reject) => {
      const linkedCompanies = await this.getlinkedCompanies(company_id)
        .catch((error) => {
          throw (error);
        });
      // check the occupant_id present in camera devices or not
      const cameraDevicesList = await database.camera_devices.findAll({
        where: {
          occupant_id, company_id: { [Op.in]: linkedCompanies },
        },
      }).then((camera) => {
        let cameraDevicesList = [];
        if (camera && camera.length > 0) {
          camera.forEach((element) => {
            if (element.gateway_id == null || !element.gateway_id) {
              cameraDevicesList.push(element);
            }
          });
        }
        return cameraDevicesList;
      }).catch((err) => {
        Logger.error('error 2271:', err);
        reject(err);
      });

      if (cameraDevicesList && cameraDevicesList.length < 1) {
        resolve([]);
      }
      let formattedCamera = {};

      if (cameraDevicesList && cameraDevicesList.length > 0) {
        const obj = {
          id: occupant_id, type: 'camera_dashboard',
        };
        obj.items = [];
        for (const key in cameraDevicesList) {
          const element = cameraDevicesList[key];
          // put here for Items
          let cameraItem = {
            id: element.id, name: element.name, type: element.type, camera_id: element.camera_id, gateway_id: element.gateway_id,
            company_id: element.company_id, occupant_id: element.occupant_id, plan_code: element.plan_code, dashboard_attributes: { type: "camera" }
          };
          obj.items.push(cameraItem);
        }
        formattedCamera = { ...obj };
        resolve(formattedCamera);
      }
      resolve(formattedCamera);
    })
  }

  // get slider location details/list
  static async getLocation(occuapnt_location_id, occupant_id, company_id) {
    return new Promise(async (resolve, reject) => {
      const linkedCompanies = await this.getlinkedCompanies(company_id)
        .catch((error) => {
          throw (error);
        });
      const locations = await database.occupants_locations.findOne({
        attributes: ['id', 'location_id'],
        include: [
          {
            required: false,
            attributes: ['id', 'address_id', 'name', 'notes'],
            model: database.locations,
            as: 'location',
            include: [{
              required: false,
              model: database.addresses,
            }],
          },
        ],
        where: {
          occupant_id,
          status: 'checked in',
          id: occuapnt_location_id,
          company_id: { [Op.in]: linkedCompanies },
        },
      }).then((result) => {
        if (!result) {
          return {};
        }
        const obj = result.dataValues;
        obj.type = 'location';
        return obj;
      }).catch((err) => {
        Logger.error('error', err);
        reject(err);
      });
      resolve(locations);
    });
  }

  static async getLocationDevicesConfigurations(location_id, occupant_id, sharedDeviceList, company_id) {
    const linkedCompanies = await this.getlinkedCompanies(company_id)
      .catch((error) => {
        throw (error);
      });
    const groupedDevices = await database.occupants_groups_devices.findAll({
      include: [
        {
          required: true,
          model: database.occupants_groups,
          where: {
            item_id: location_id,
            occupant_id,
            company_id: { [Op.in]: linkedCompanies },
          },
        },
      ],
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const groupedDeviceList = [];
      for (const iterator of result) {
        groupedDeviceList.push(iterator.device_id);
      }
      return groupedDeviceList;
    }).catch((err) => {
      throw err;
    });
    const devices = await database.devices.findAll({
      attributes: ['id', 'device_code', 'name', 'model'],
      model: database.devices,
      include: [
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
          },
          as: 'dashboard_attributes',
        },
        {
          required: false,
          attributes: ['key', 'value'],
          model: database.devices_metadata,
        }, {
          required: false,
          attributes: ['name', 'category_id'],
          model: database.categories,
          as: 'category',
        }, {
          required: false,
          model: database.alert_communication_configs,
          where: {
            occupant_id,
          },
        }],
      where: {
        type: null,
        location_id,
        id: {
          [Op.notIn]: groupedDevices,
        },
        device_code: {
          [Op.in]: sharedDeviceList,
        },
      },

    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const deviceList = [];
      for (const element of result) {
        const deviceObj = element.dataValues;
        if (!element.dashboard_attributes) {
          deviceObj.dashboard_attributes = {
            type: 'device',
          };
        }
        const isDeviceIncludes = sharedDeviceList.includes(deviceObj.device_code);
        if (isDeviceIncludes === true) {
          deviceList.push(deviceObj);
        }
      }
      return deviceList;
    }).catch((err) => {
      throw err;
    });
    return devices;
  }

  static async getLocationGroupsConfigurations(occupant_location_id, occupant_id, company_id, sharedDeviceList) {
    const linkedCompanies = await this.getlinkedCompanies(company_id)
      .catch((error) => {
        throw (error);
      });
    const groups = await database.occupants_groups.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          attributes: ['id'],
          required: false,
          model: database.occupants_groups_devices,
          include: [{
            attributes: ['id', 'device_code', 'name', 'model'],
            model: database.devices,
            include: [{
              required: false,
              attributes: ['name', 'category_id'],
              model: database.categories,
              as: 'category',
            }, {
              required: false,
              attributes: ['id', 'type', 'grid_order'],
              model: database.occupants_dashboard_attributes,
              where: {
                occupant_id,
              },
              as: 'dashboard_attributes',
            }, {
              required: false,
              model: database.alert_communication_configs,
              where: {
                occupant_id,
              },
            }],
            where: {
              device_code: { [Op.in]: sharedDeviceList },
            },
          }],
          as: 'devices',
        },
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
          },
          as: 'dashboard_attributes',
        },
      ],
      where: {
        occupant_id, item_id: occupant_location_id, company_id: { [Op.in]: linkedCompanies },
      },
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const formatedLocations = [];
      for (const group of result) {
        const obj = group.dataValues;
        if (!obj.dashboard_attributes) {
          obj.dashboard_attributes = {
            type: 'group',
          };
        }
        if (group.devices) {
          obj.items = [];
          for (const element of group.devices) {
            const deviceObj = element.device.dataValues;
            deviceObj.group_device_id = element.id;
            // deviceObj.dashboard_attributes = element.dashboard_attributes;
            if (!deviceObj.dashboard_attributes) {
              deviceObj.dashboard_attributes = {
                type: 'device',
              };
            }
            deviceObj.category = element.device.category;
            obj.items.push(deviceObj);
          }
        }
        delete obj.devices;
        formatedLocations.push(obj);
      }
      return formatedLocations;
    }).catch((err) => { console.log(err); });
    return groups;
  }

  static async sharedDeviceList(identity_id) {
    const deviceList = await OccupantDashboardService.getUserData(identity_id);
    if (deviceList.Items.length > 0) {
      const sharerString = deviceList.Items[0].Sharer.replace(/\\/g, '');
      const sharerObj = JSON.parse(sharerString);
      const sharerList = sharerObj.list || [];
      const sharedDeviceList = lodash.remove(sharerList, (n) => {
        const splitArr = n.split('-');
        if (splitArr.length > 2) {
          return n;
        }
      });
      return sharedDeviceList;
    }
    return [];
  }

  static async getSliderSharedLocationDetails(id, occupant_id, identity_id, company_id) {
    const sharedDeviceList = await this.sharedDeviceList(identity_id);
    const occuapantLocation = await this.getLocation(id, occupant_id, company_id).catch((err) => { console.log(err); throw err; });

    if (Object.keys(occuapantLocation).length < 1) {
      const err = ErrorCodes['160050'];
      throw err;
    }
    const obj = { ...occuapantLocation };

    delete obj.location_id;
    const [devices, groups] = await Promise.all([this.getLocationDevicesConfigurations(occuapantLocation.location_id, occupant_id, sharedDeviceList, company_id), this.getLocationGroupsConfigurations(id, occupant_id, company_id, sharedDeviceList)]);
    const items = [...devices, ...groups];
    obj.items = lodash.sortBy(items, 'dashboard_attributes.grid_order');
    return obj;
  }

  // ungrouped devices
  static async getUnGroupedGatewayDevicesList(gateway_id, occupant_id) {
    const groupedDevices = await database.occupants_groups_devices.findAll({
      include: [
        {
          required: true,
          model: database.occupants_groups,
          where: {
            item_id: gateway_id,
            occupant_id,
          },
        },
      ],
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const groupedDeviceList = [];
      for (const iterator of result) {
        groupedDeviceList.push(iterator.device_id);
      }
      return groupedDeviceList;
    }).catch((err) => {
      throw err;
    });
    const devices = await database.devices.findAll({
      attributes: ['id', 'device_code', 'name', 'model'],
      model: database.devices,
      include: [
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
          },
          as: 'dashboard_attributes',
        },
        {
          required: false,
          attributes: ['key', 'value'],
          model: database.devices_metadata,
        }, {
          required: false,
          attributes: ['name', 'category_id'],
          model: database.categories,
          as: 'category',
        }],
      where: {
        type: null,
        gateway_id,
        id: {
          [Op.notIn]: groupedDevices,
        },
        is_manually_added: true,
      },

    }).catch((err) => {
      throw err;
    });
    return devices;
  }

  static async getUnGroupedLocationDevicesList(id, occupant_id, identity_id, company_id) {
    const sharedDeviceList = await this.sharedDeviceList(identity_id);
    const occuapantLocation = await this.getLocation(id, occupant_id, company_id).catch((err) => { console.log(err); throw err; });
    if (Object.keys(occuapantLocation).length < 1) {
      const err = ErrorCodes['160050'];
      throw err;
    }
    const groupedDevices = await database.occupants_groups_devices.findAll({
      include: [
        {
          model: database.occupants_groups,
          where: {
            item_id: id,
            occupant_id,
          },
        },
      ],
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const groupedDeviceList = [];
      for (const iterator of result) {
        groupedDeviceList.push(iterator.device_id);
      }
      return groupedDeviceList;
    }).catch((err) => {
      throw err;
    });
    const devices = await database.devices.findAll({
      attributes: ['id', 'device_code', 'name', 'model'],
      model: database.devices,
      include: [
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
          },
          as: 'dashboard_attributes',
        },
        {
          required: false,
          attributes: ['key', 'value'],
          model: database.devices_metadata,
        }, {
          required: false,
          attributes: ['name', 'category_id'],
          model: database.categories,
          as: 'category',
        },
      ],
      where: {
        type: null,
        location_id: occuapantLocation.location_id,
        id: {
          [Op.notIn]: groupedDevices,
        },
        device_code: {
          [Op.in]: sharedDeviceList,
        },
      },

    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const deviceList = [];
      for (const element of result) {
        const deviceObj = element.dataValues;

        const isDeviceIncludes = sharedDeviceList.includes(deviceObj.device_code);
        if (isDeviceIncludes === true) {
          deviceList.push(deviceObj);
        }
      }
      return deviceList;
    }).catch((err) => {
      throw err;
    });
    return devices;
  }

  // Groups
  static async getGatewayGroups(gateway_id, occupant_id) {
    const devices = await database.occupants_groups.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          attributes: ['id'],
          required: true,
          model: database.occupants_groups_devices,
          include: [{
            attributes: ['id', 'device_code', 'name', 'model'],
            model: database.devices,
            include: [{
              required: false,
              attributes: ['name', 'category_id'],
              model: database.categories,
              as: 'category',
            }, {
              required: false,
              attributes: ['id', 'type', 'grid_order'],
              model: database.occupants_dashboard_attributes,
              where: {
                occupant_id,
              },
              as: 'dashboard_attributes',
            }],
            where: {
              is_manually_added: true,
            },
          }],
          as: 'devices',
        },
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
          },
          as: 'dashboard_attributes',
        },
      ],
      where: {
        occupant_id, item_id: gateway_id,
      },
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const formatedLocations = [];
      for (const group of result) {
        const obj = group.dataValues;
        if (group.devices) {
          obj.list = [];
          for (const element of group.devices) {
            const deviceObj = element.device.dataValues;
            deviceObj.group_device_id = element.id;
            // deviceObj.dashboard_attributes = element.dashboard_attributes;
            if (!deviceObj.dashboard_attributes) {
              deviceObj.dashboard_attributes = {
                type: 'device',
              };
            }
            obj.list.push(deviceObj);
          }
        }
        delete obj.devices;
        formatedLocations.push(obj);
      }
      return formatedLocations;
    }).catch((err) => { console.log(err); });
    return devices;
  }

  static async getLocationGroups(occupant_location_id, occupant_id) {
    const groups = await database.occupants_groups.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          attributes: ['id'],
          required: true,
          model: database.occupants_groups_devices,
          include: [{
            attributes: ['id', 'device_code', 'name', 'model'],
            model: database.devices,
            include: [{
              required: false,
              attributes: ['name', 'category_id'],
              model: database.categories,
              as: 'category',
            }, {
              required: false,
              attributes: ['id', 'type', 'grid_order'],
              model: database.occupants_dashboard_attributes,
              where: {
                occupant_id,
              },
              as: 'dashboard_attributes',
            }],
          }],
          as: 'devices',
        },
        {
          required: false,
          attributes: ['id', 'type', 'grid_order'],
          model: database.occupants_dashboard_attributes,
          where: {
            occupant_id,
          },
          as: 'dashboard_attributes',
        },
      ],
      where: {
        occupant_id, item_id: occupant_location_id,
      },
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const formatedLocations = [];
      for (const group of result) {
        const obj = group.dataValues;
        if (group.devices) {
          obj.list = [];
          for (const element of group.devices) {
            const deviceObj = element.device.dataValues;
            deviceObj.group_device_id = element.id;
            // deviceObj.dashboard_attributes = element.dashboard_attributes;
            if (!deviceObj.dashboard_attributes) {
              deviceObj.dashboard_attributes = {
                type: 'device',
              };
            }
            deviceObj.category = element.device.category;
            obj.list.push(deviceObj);
          }
        }
        delete obj.devices;
        formatedLocations.push(obj);
      }
      return formatedLocations;
    }).catch((err) => { console.log(err); });

    return groups;
  }

  // categories
  static async getGatewayCategories(gateway_id, occupant_id) {
    const modelList = await database.devices.findAll({
      attributes: [[database.Sequelize.fn('DISTINCT', database.Sequelize.col('model')), 'model']],
      where: {
        type: null,
        gateway_id,
        is_manually_added: true,
      },
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const list = [];
      for (const iterator of result) {
        list.push(iterator.model);
      }
      return list;
    }).catch((err) => {
      console.log(err);
      throw err;
    });

    const categories = await database.categories.findAll({
      attributes: ['name', 'model', 'category_id'],
      include: [{
        attributes: ['id', 'device_code', 'name', 'model'],
        model: database.devices,
        include: [
          {
            required: false,
            attributes: ['id', 'type', 'grid_order'],
            model: database.occupants_dashboard_attributes,
            where: {
              occupant_id,
            },
            as: 'dashboard_attributes',
          },
          {
            required: false,
            attributes: ['key', 'value'],
            model: database.devices_metadata,
          }, {
            required: false,
            attributes: ['name', 'category_id'],
            model: database.categories,
            as: 'category',
          }],
        as: 'devices',
        where: {
          type: null,
          gateway_id,
          is_manually_added: true,
        },
      }],
      where: {
        model: {
          [Op.in]: modelList,
        },
      },
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }

      const list = [];
      for (const element of result) {
        const obj = { ...element.dataValues };
        obj.count = obj.devices.length;
        list.push(obj);
      }
      return list;
    }).catch((err) => {
      throw err;
    });
    return categories;
  }

  static async getLocationCategories(id, occupant_id, identity_id, company_id) {
    const sharedDeviceList = await this.sharedDeviceList(identity_id);
    const occuapantLocation = await this.getLocation(id, occupant_id, company_id).catch((err) => { console.log(err); throw err; });

    if (Object.keys(occuapantLocation).length < 1) {
      const err = ErrorCodes['160050'];
      throw err;
    }
    const modelList = await database.devices.findAll({
      attributes: [[database.Sequelize.fn('DISTINCT', database.Sequelize.col('model')), 'model']],
      where: {
        type: null,
        location_id: occuapantLocation.location_id,
      },
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }
      const list = [];
      for (const iterator of result) {
        list.push(iterator.model);
      }
      return list;
    }).catch((err) => {
      throw err;
    });

    const categories = await database.categories.findAll({
      attributes: ['name', 'model', 'category_id'],
      include: [{
        attributes: ['id', 'device_code', 'name', 'model'],
        model: database.devices,
        include: [
          {
            required: false,
            attributes: ['id', 'type', 'grid_order'],
            model: database.occupants_dashboard_attributes,
            where: {
              occupant_id,
            },
            as: 'dashboard_attributes',
          },
          {
            required: false,
            attributes: ['key', 'value'],
            model: database.devices_metadata,
          }, {
            required: false,
            attributes: ['name', 'category_id'],
            model: database.categories,
            as: 'category',
          }],
        as: 'devices',
        where: {
          type: null,
          location_id: occuapantLocation.location_id,
          device_code: {
            [Op.in]: sharedDeviceList,
          },
        },
      }],
      where: {
        model: {
          [Op.in]: modelList,
        },
      },
    }).then((result) => {
      if (!result || result.length == 0) {
        return [];
      }

      const list = [];
      for (const element of result) {
        const obj = { ...element.dataValues };
        obj.count = obj.devices.length;
        const deviceObj = obj.devices;
        const isDeviceIncludes = sharedDeviceList.includes(deviceObj[0].device_code);
        if (isDeviceIncludes === true) {
          list.push(obj);
        }
      }
      return list;
    }).catch((err) => {
      throw err;
    });
    return categories;
  }

  static async getOccupantProfile(occupant_id, company_id) {
    return new Promise(async (resolve, reject) => {
      database.occupants.findOne({
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number', 'cognito_id', 'identity_id', 'language', 'country'],
        include: [{
          attributes: ['id', 'key', 'value'],
          model: database.occupants_metadata,
        }],
        where: { id: occupant_id },
      }).then(async (occupant) => {
        const obj = { occupant_id };
        const address = await this.getOccupantLocationAddress(obj).catch((error) => {
          console.log(error);
          const err = ErrorCodes['160043'];
          reject(err);
        });
        const occupantPermissions = await this.getOccupantPermissions(occupant_id, company_id).catch((err) => {
          const error = ErrorCodes['160026'];
          reject(err);
        });
        // initialize the array to store the formatted occupant_permissions data
        var finalOccupantsPermssions = []
        if (occupant && occupantPermissions && address) {
          occupant.dataValues.locations = address;
          occupant.dataValues.occupant_permissions = occupantPermissions;
          // occupant.dataValues.occupant_camera_permissions = occupantCameraPermissions;
          // formatting the occupant permissions code for displaying camera_permissions based on sharer and owner
          if (occupantPermissions && occupantPermissions.length >= 1) {
            for (const iterator of occupantPermissions) {
              let cameraDevices = [];
              var ele = iterator
              if (iterator.receiver_occupant_id == iterator.sharer_occupant_id) { //owner
                cameraDevices = iterator.gateway.camera_devices;
              } else { //sharer
                for (let index = 0; index < iterator.camera_permissions.length; index++) {
                  const element = iterator.camera_permissions[index];
                  cameraDevices.push(element.camera_device)
                }
              }
              delete ele.gateway.dataValues.camera_devices;
              delete ele.dataValues.camera_permissions;
              ele.dataValues["camera_permissions"] = cameraDevices;
              finalOccupantsPermssions.push(ele);
            }
          }
          // assigning the formatted occupant_permissions
          occupant.dataValues.occupant_permissions = finalOccupantsPermssions;
        }
        let new_privacy_detected = false;
        let privacy_version = null;
        if (occupant.occupants_metadata && occupant.occupants_metadata.length > 0) {
          const privacy_version_metadata = occupant.occupants_metadata.filter((t) => {
            if (t.key == 'privacy_version') {
              return t.value;
            }
          });
          if (privacy_version_metadata && privacy_version_metadata.length > 0) {
            privacy_version = privacy_version_metadata[0].value;
          }
          if (!privacy_version) {
            occupant.dataValues.new_privacy_detected = new_privacy_detected;
          } else {
            let key = 'latest_privacy_version'
            let constants = await data(key);
            if (!constants) {
              occupant.dataValues.new_privacy_detected = new_privacy_detected;
            } else {
              let latestPrivacyVersion = constants;
              if (parseInt(latestPrivacyVersion) > parseInt(privacy_version)) {
                new_privacy_detected = true;
                occupant.dataValues.latest_privacy_version = constants;
                occupant.dataValues.new_privacy_detected = new_privacy_detected;
              } else {
                occupant.dataValues.latest_privacy_version = constants;
                occupant.dataValues.new_privacy_detected = new_privacy_detected
              }
            }
          }
        } else {
          occupant.dataValues.new_privacy_detected = new_privacy_detected;
        }
        let new_terms_detected = false;
        let term_version = null;
        if (occupant.occupants_metadata && occupant.occupants_metadata.length > 0) {
          const term_policy_metadata = occupant.occupants_metadata.filter((t) => {
            if (t.key == 'term_version') {
              return t.value;
            }
          });
          if (term_policy_metadata && term_policy_metadata.length > 0) {
            term_version = term_policy_metadata[0].value;
          }
          if (!term_version) {
            occupant.dataValues.new_terms_detected = new_terms_detected;
          } else {
            let key = 'latest_term_version'
            let constants = await data(key);
            if (!constants) {
              occupant.dataValues.new_terms_detected = new_terms_detected;
            } else {
              let latestTermPolicyVersion = constants;
              if (parseInt(latestTermPolicyVersion) > parseInt(term_version)) {
                new_terms_detected = true;
                occupant.dataValues.latest_term_policy = constants;
                occupant.dataValues.new_terms_detected = new_terms_detected;
              } else {
                occupant.dataValues.latest_term_policy = constants;
                occupant.dataValues.new_terms_detected = new_terms_detected
              }
            }
          }
        } else {
          occupant.dataValues.new_terms_detected = new_terms_detected;
        }
        resolve(occupant);
      }).catch((error) => {
        console.log("🚀 ~ file: OccupantService.js:3266 ~ returnnewPromise ~ error:", error)
        const err = ErrorCodes['160043'];
        reject(err);
      });
    });
  }
}

export default OccupantService;
