import { Op } from 'sequelize';
import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import jobsService from './JobsService';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import OccupantService from './OccupantService';
import CheckAllDeviceAccess from '../helpers/CheckAllDeviceAccess';
import { getCompany } from '../../cache/Companies';

const moment = require('moment');

class OccupantLocationsService {
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

  static async getLocation(locationId) {
    const locationsObj = await database.locations
      .findOne({
        where: {
          id: locationId,
        },
        raw: true,
      })
      .then((result) => result);
    if (!locationsObj) {
      const err = ErrorCodes['160001'];
      throw err;
    }
    return locationsObj;
  }

  static async getOccupantsLatestLocation(locationId, status, occupantId) {
    const latestStatus = await database.occupants_locations.findOne({
      where: {
        location_id: locationId,
        occupant_id: occupantId,
      },
      order: [['updated_at', 'DESC']],
    });
    if (latestStatus && latestStatus.status === status) {
      const err = ErrorCodes['110000'];
      throw err;
    }
    return latestStatus;
  }

  static async getLocationsCount(locationId, status) {
    const count = await database.occupants_locations.count({
      where: {
        location_id: locationId,
        [Op.or]: [{ status }, { status: 'invited' }],
      },
      order: [['updated_at', 'DESC']],
    });
    if (count >= 10) {
      const err = ErrorCodes['160014'];
      throw err;
    }
    return count;
  }

  static async locationPermission(locationId, userId) {
    const locationPermission = await database.locations_permissions
      .findOne({
        where: {
          location_id: locationId,
          user_id: userId,
        },
        raw: true,
      });
    if (!locationPermission) {
      const err = ErrorCodes['160015'];
      throw err;
    }
    return null;
  }

  static async occupantCheckIn(req) {
    const occupantInviteId = req.body.occupant_invite_id;
    const occupantId = req.body.occupant_id;
    const locationId = req.body.location_id;
    const companyId = req.company_id;
    const status = Entities.occupant.event_name.status_checkin;
    const createdBy = req.user_id;
    const updatedBy = req.user_id;
    let occupantCheckIn = null;
    const userId = req.user_id;
    const accessToList = [];
    const query = {
      companyId,
      userId,
    };
    const checkDeviceAccess = await CheckAllDeviceAccess(query);
    await this.getLocation(locationId);
    if (checkDeviceAccess !== true) {
      await this.locationPermission(locationId, userId);
    }
    await this.getLocationsCount(locationId, status);
    if (occupantInviteId && occupantId == null) {
      const FindEmailData = await database.occupants_invitations.findOne({
        where: {
          id: occupantInviteId,
        },
      });
      const getPreDetails = await database.occupants_locations.findOne({
        where: {
          location_id: locationId,
          occupant_invite_id: occupantInviteId,
        },
        order: [['updated_at', 'DESC']],
      });
      if (getPreDetails && getPreDetails.status === 'invited') {
        const err = ErrorCodes['110000'];
        throw err;
      }
      occupantCheckIn = await database.occupants_locations.create({
        location_id: locationId,
        occupant_invite_id: occupantInviteId,
        check_in_by: req.user_id,
        check_in_at: new Date(),
        status: 'invited',
        company_id: companyId,
      }).then(async (result) => {
        const occupantCheckInObj = result.dataValues;
        return { occupantCheckInObj };
      }).catch((err) => {
        throw (err);
      });

      const LocationId = occupantCheckIn.occupantCheckInObj.location_id;
      const locationData = await database.locations.findOne({
        where: {
          id: LocationId,
        },
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

      const accessLocations = await OccupantService.formatLocations(accessToList);
      const final_access = (accessLocations !== null) ? accessLocations : 'No Access';

      const { body } = req;
      const occupantObj = occupantCheckIn.occupantCheckInObj;
      const companyDetails = await getCompany(companyId).then(result => {
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
      const obj = {
        old: {},
        new: occupantObj,
      };
      const placeholdersData = {
        access_to: final_access,
        user_name: FindEmailData.email,
        button_link: buttonLink,
        check_in_time: moment(new Date(occupantCheckIn.occupantCheckInObj.check_in_at)).utc().format('hh:mm A'),
        check_in_date: moment(new Date(occupantCheckIn.occupantCheckInObj.check_in_at)).utc().format('DD-MM-YYYY'),
        receiverList: [{ email: FindEmailData.email }],
      };

      ActivityLogs.addActivityLog(Entities.occupant.entity_name,
        Entities.occupant.event_name.location_updated, obj,
        Entities.notes.event_name.added, occupantInviteId,
        body.company_id, req.user_id, occupantId);
      ActivityLogs.addActivityLog(Entities.locations.entity_name,
        Entities.locations.event_name.occupant_checked_in, obj,
        Entities.notes.event_name.added, locationId,
        body.company_id, req.user_id, occupantId, placeholdersData, req.source_IP);
    }
    if (occupantId) {
      const occupantInfo = await this.getOccupant(occupantId);
      await this.getOccupantsLatestLocation(locationId, status, occupantId);
      const input = {
        userIdentityId: occupantInfo.identity_id,
        userName: occupantInfo.email,
        locationId,
        occupantId,
        adminIdentityId: req.body.admin_identity_id,
        authorization: req.headers['x-access-token'],
        adminEmail: req.userDetails.email,
      };
      occupantCheckIn = await database.occupants_locations.create({
        location_id: locationId,
        occupant_id: occupantId,
        check_in_by: req.user_id,
        check_in_at: new Date(),
        status,
        company_id: companyId,
        occupant_invite_id: occupantInviteId,
      }).then(async (result) => {
        const occupantCheckInObj = result.dataValues;
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

      const locationData = await database.locations.findOne({
        where: {
          id: locationId,
        },
      }).catch((err) => {
        throw (err);
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

      const accessLocations = await OccupantService.formatLocations(accessToList);
      const final_access = (accessLocations !== null) ? accessLocations : 'No Access';

      const { body } = req;
      const { userDetails } = req;

      const occupantObj = occupantCheckIn.occupantCheckInObj;
      const companyDetails = await getCompany(companyId).then(result => {
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
      const obj = {
        old: {},
        new: occupantObj,
      };
      const placeholdersData = {
        access_to: final_access,
        user_name: occupantInfo.first_name,
        button_link: buttonLink,
        check_in_time: moment(new Date(occupantCheckIn.occupantCheckInObj.check_in_at)).utc().format('hh:mm A'),
        check_in_date: moment(new Date(occupantCheckIn.occupantCheckInObj.check_in_at)).utc().format('DD-MM-YYYY'),
        receiverList: [{ email: occupantInfo.email }],
      };

      ActivityLogs.addActivityLog(Entities.occupant.entity_name,
        Entities.occupant.event_name.check_in, obj, Entities.notes.event_name.added, occupantId,
        body.company_id, req.user_id, occupantId, placeholdersData, req.source_IP);
    }
    return occupantCheckIn;
  }

  static async occupantCheckOut(req) {
    const { body } = req;
    const occupantInviteId = body.occupant_invite_id;
    const userId = req.user_id;
    const companyId = req.company_id;
    const createdBy = req.user_id;
    const updatedBy = req.user_id;
    const status = Entities.occupant.event_name.status_checkout;
    const occupantId = body.occupant_id;
    const locationId = body.location_id;
    let occupantCheckoutObj = null;
    const accessToList = [];
    const query = {
      companyId,
      userId,
    };
    const checkDeviceAccess = await CheckAllDeviceAccess(query);
    await this.getLocation(locationId);
    if (checkDeviceAccess !== true) {
      await this.locationPermission(locationId, userId);
    }
    if (occupantInviteId && occupantId == null) {
      const OccupantCheckeOut = await database.occupants_locations.findOne({
        where: {
          occupant_invite_id: occupantInviteId,
          location_id: locationId,
        },
      });
      const FindEmailData = await database.occupants_invitations.findOne({
        where: {
          id: occupantInviteId,
        },
      });

      const LocationId = OccupantCheckeOut.location_id;
      const locationData = await database.locations.findOne({
        where: {
          id: LocationId,
        },
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

      const accessLocations = await OccupantService.formatLocations(accessToList);
      const final_access = (accessLocations !== null) ? accessLocations : 'No Access';

      const placeholdersData = {
        access_to: final_access,
        user_name: FindEmailData.email,
        check_out_date: moment(new Date()).utc().format('DD-MM-YYYY'),
        check_out_time: moment(new Date()).utc().format('hh:mm A'),
        receiverList: [{
          email: FindEmailData.email,
        }],
      };

      if (OccupantCheckeOut) {
        await database.occupants_locations.destroy({
          where: {
            id: OccupantCheckeOut.id,
          },
        });
      } else {
        const err = ErrorCodes['160012'];
        throw err;
      }
      const obj = {
        old: OccupantCheckeOut,
        new: {},
      };
      ActivityLogs.addActivityLog(Entities.occupant.entity_name,
        Entities.occupant.event_name.location_updated, obj,
        Entities.notes.event_name.deleted, occupantInviteId,
        body.company_id, req.user_id);
      ActivityLogs.addActivityLog(Entities.locations.entity_name,
        Entities.locations.event_name.occupant_checked_out, obj,
        Entities.notes.event_name.updated, locationId,
        body.company_id, req.user_id, null, placeholdersData, req.source_IP);
      return null;
    }
    if (occupantId) {
      const getPreDetails = await database.occupants_locations.findOne({
        where: {
          occupant_id: occupantId,
          location_id: locationId,
        },
      }).catch((err) => {
        throw err;
      });
      const FindEmail = await database.occupants.findOne({
        where: {
          id: occupantId,
        },
      }).catch((err) => {
        throw err;
      });

      const LocationId_registered = getPreDetails.location_id;
      const locationData = await database.locations.findOne({
        where: {
          id: LocationId_registered,
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

      const accessLocations = await OccupantService.formatLocations(accessToList);
      const final_access = (accessLocations !== null) ? accessLocations : 'No Access';

      const preData = {
        status: getPreDetails.status,
        check_out_by: getPreDetails.check_out_by,
        check_out_at: getPreDetails.check_out_at,
      };

      const update = { status, check_out_by: userId, check_out_at: new Date() };
      await this.getLocation(locationId);
      const occupantInfo = await this.getOccupant(occupantId);

      await this.getOccupantsLatestLocation(locationId, status, occupantId);
      const input = {
        userIdentityId: occupantInfo.identity_id,
        userName: occupantInfo.email,
        locationId,
        adminIdentityId: req.body.admin_identity_id,
        authorization: req.headers['x-access-token'],
        occupantId,
        userId,
        adminEmail: req.userDetails.email,
      };
      occupantCheckoutObj = {
        updated_data: update,
      };
      const jobObj = await jobsService.createJob('locationCheckOut', input, companyId, createdBy, updatedBy, null, req.request_id)
        .then(async (resp) => resp).catch((err) => {
          throw (err);
        });
      const placeholdersData = {
        access_to: final_access,
        user_name: FindEmail.first_name,
        check_out_date: moment(new Date(jobObj.updated_at)).utc().format('DD-MM-YYYY'),
        check_out_time: moment(new Date(jobObj.updated_at)).utc().format('hh:mm A'),
        receiverList: [{
          email: FindEmail.email,
        }],
      };
      occupantCheckoutObj.jobId = jobObj.id;
      const obj = {
        old: preData,
        new: occupantCheckoutObj,
      };
      ActivityLogs.addActivityLog(
        Entities.occupant.entity_name, Entities.occupant.event_name.check_out,
        obj, Entities.notes.event_name.updated, occupantId, body.company_id, req.user_id,
        occupantId, placeholdersData, req.source_IP
      );
      return occupantCheckoutObj;
    }
    return occupantCheckoutObj;
  }

  static async addOccupantLocation(location_id, status, company_id, occupant_id) {
    await database.occupants_locations.create({
      location_id,
      status,
      company_id,
      occupant_id,
    }).then(async (result) => {
      const occupantCheckInObj = result.dataValues;
      return { occupantCheckInObj };
    }).catch((err) => {
      console.log(err);
      throw (err);
    });
  }
}

export default OccupantLocationsService;
