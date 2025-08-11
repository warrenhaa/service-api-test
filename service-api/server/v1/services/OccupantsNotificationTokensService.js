import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import OccupantService from './OccupantService';

class OccupantsNotificationTokensService {
  static async getDataOccupantsNotificationTokens(id) {
    const getDataNotificationTokens = await database.occupants_notification_tokens.findOne({
      where: { id },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160024'];
      throw err;
    });
    return getDataNotificationTokens;
  }

  static async getOccupantsNotificationTokens(id, companyId) {
    const getNotificationTokens = await database.occupants_notification_tokens.findAll({
      where: { occupant_id: id, company_id: companyId },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160024'];
      throw new ApplicationError(err);
    });
    return getNotificationTokens;
  }

  static async addOccupantsNotificationTokens(body, companyId, occupant_id, source_IP) {
    const notificationTokens = await database.occupants_notification_tokens.findOne({
      where: { token: body.token, occupant_id },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160024'];
      throw err;
    });
    if (!notificationTokens) {
      const addNotificationTokens = await database.occupants_notification_tokens.create({
        occupant_id,
        dnd: body.dnd,
        os: body.os,
        token: body.token,
        company_id: companyId,
        is_enable: body.is_enable,
      }).then(async (result) => {
        if (result) {
          const profile = await OccupantService.getOccupantProfile(occupant_id, companyId).catch((err) => {
          });
          let mergedNotificationTokens = {};
          mergedNotificationTokens = result.toJSON();
          mergedNotificationTokens.profile = profile;
          return mergedNotificationTokens;
        }
        return null;
      }).catch(() => {
        const err = ErrorCodes['160035'];
        throw err;
      });

      const Obj = {
        old: {},
        new: addNotificationTokens,
      };
      if (addNotificationTokens) {
        ActivityLogs.addActivityLog(Entities.occupants_notification_tokens.entity_name, Entities.occupants_notification_tokens.event_name.added,
          Obj, Entities.notes.event_name.added, occupant_id, companyId, null, occupant_id, null, source_IP);
      }
      return addNotificationTokens;
    }
    const updatedData = await this.updateOccupantsNotificationTokens(
      notificationTokens.id, body, occupant_id, companyId,
    );
    return updatedData;
  }

  static async updateOccupantsNotificationTokens(id, body, occupant_id, companyId, source_IP) {
    const oldObj = {};
    const newObj = {};
    const existingData = await this.getDataOccupantsNotificationTokens(id);
    let afterUpdate = null;
    if (!existingData) {
      const err = ErrorCodes['160024'];
      throw err;
    }

    // delete occupant_id and company_id if present in body
    if (body.hasOwnProperty('occupant_id')) {
      delete body.occupant_id;
    }
    if (body.hasOwnProperty('company_id')) {
      delete body.company_id;
    }
    if (body.hasOwnProperty('data')) {

      if (body.data.hasOwnProperty('camera_notification_enable')) {
        var camera_notification_enable = body.data.camera_notification_enable
        body.data = { "camera_notification_enable": camera_notification_enable }
      }
    }
    const updatedData = await database.occupants_notification_tokens.update(body, {
      where: { id, occupant_id },
      returning: true,
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160038'];
      throw err;
    });
    afterUpdate = await this.getDataOccupantsNotificationTokens(id).then((result) => result).catch(() => {
      const err = ErrorCodes['160022'];
      throw err;
    });
    Object.keys(body).forEach((key) => {
      if (JSON.stringify(existingData[key]) !== JSON.stringify(body[key])) {
        oldObj[key] = existingData[key];
        newObj[key] = body[key];
      }
    });
    const obj = {
      old: oldObj,
      new: newObj,
    };
    const deletedExistingData = { ...existingData };
    delete deletedExistingData.updated_at;

    const deletedAfterUpdate = { ...afterUpdate };
    delete deletedAfterUpdate.updated_at;

    if (JSON.stringify(deletedExistingData) !== JSON.stringify(deletedAfterUpdate)) {
      ActivityLogs.addActivityLog(Entities.occupants_notification_tokens.entity_name, Entities.occupants_notification_tokens.event_name.updated,
        obj, Entities.notes.event_name.updated, occupant_id, companyId, null, occupant_id, null, source_IP);
    }
    return afterUpdate;
  }

  static async deleteOccupantsNotificationTokens(token, occupant_id, companyId, source_IP) {
    const deleteNotificationToken = await database.occupants_notification_tokens.findOne({
      where: { token, occupant_id },
    });
    if (!deleteNotificationToken) {
      return {};
    }
    const deletedData = await database.occupants_notification_tokens.destroy({
      where: { token, occupant_id },
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160023'];
      throw err;
    });

    const obj = {
      old: deleteNotificationToken,
      new: {},
    };
    ActivityLogs.addActivityLog(Entities.occupants_notification_tokens.entity_name, Entities.occupants_notification_tokens.event_name.deleted,
      obj, Entities.notes.event_name.deleted, occupant_id, companyId, null, occupant_id, null, source_IP);
    return deletedData;
  }
}

export default OccupantsNotificationTokensService;
