import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import ErrorCodes from '../../errors/ErrorCodes';

class UserPreferencesService {
  static async getUserPreferences(userId) {
    const userPreferences = await database.user_preferences.findOne({
      where: {
        user_id: userId,
      },
      raw: true,
    }).then((result) => result);
    if (!userPreferences) {
      const err = ErrorCodes['320003'];
      throw err;
    }
    return userPreferences;
  }

  static async createUserPreferences(req) {
    const userId = req.user_id;
    const userPreferences = await database.user_preferences.findOne({
      where: {
        user_id: userId,
      },
    });
    if (userPreferences) {
      const err = ErrorCodes['320002'];
      throw err;
    }
    const newuserPreferences = await database.user_preferences.create({
      user_id: req.user_id,
      company_id: req.company_id,
      time_format: req.body.time_format,
      date_format: req.body.date_format,
      timezone_format: req.body.timezone_format,
      temperature_format: req.body.temperature_format,
      country: req.body.country,

    }).catch(() => {
      const err = ErrorCodes['320001'];
      throw err;
    });
    const obj = {
      old: {},
      new: newuserPreferences,
    };
    ActivityLogs.addActivityLog(Entities.user_preferences.entity_name,
      Entities.user_preferences.event_name.added, obj,
      Entities.notes.event_name.added, req.user_id,
      req.company_id, req.user_id, null);
    return newuserPreferences;
  }

  static async updateUserPreferences(req, userId) {
    const oldObj = {};
    const newObj = {};
    const companyId = req.body.company_id;
    delete req.body.company_id;
    const userPreferences = await this.getUserPreferences(userId);
    if (!userPreferences) {
      const err = ErrorCodes['320003'];
      throw err;
    }
    const updateObj = req.body;
    const userPreferencesUpdate = await database.user_preferences.update(updateObj, {
      where: { user_id: userId },
      returning: true,
      plain: true,
      raw: true,
    }).then((result) => result[1])
      .catch(() => {
        const err = ErrorCodes['320004'];
        throw err;
      });
    Object.keys(userPreferencesUpdate).forEach((key) => {
      if (userPreferencesUpdate.hasOwnProperty(key) && JSON.stringify(userPreferences[key])
        !== JSON.stringify(userPreferencesUpdate[key])) {
        oldObj[key] = userPreferences[key];
        newObj[key] = userPreferencesUpdate[key];
      }
    });
    const obj = {
      old: oldObj,
      new: newObj,
    };
    ActivityLogs.addActivityLog(Entities.user_preferences.entity_name,
      Entities.user_preferences.event_name.updated,
      obj, Entities.notes.event_name.updated,
      req.user_id, companyId, req.user_id, null);
    return userPreferencesUpdate;
  }
}

export default UserPreferencesService;
