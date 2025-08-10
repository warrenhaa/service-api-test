import UserPreferencesService from '../services/UserPreferencesService';
import Util from '../../utils/Utils';

const util = new Util();

class UserPreferencesController {
  static async updateUserPreferences(req, res) {
    const userId = req.user_id;
    const userPreferences = await UserPreferencesService.updateUserPreferences(req, userId)
      .then((result) => result)
      .catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, userPreferences);
    return util.send(req, res);
  }

  static async getUserPreferences(req, res) {
    const userId = req.user_id;
    const userPreferences = await UserPreferencesService.getUserPreferences(userId)
      .then((result) => result)
      .catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, userPreferences);
    return util.send(req, res);
  }

  static async createUserPreferences(req, res) {
    const userPreferences = await UserPreferencesService.createUserPreferences(req)
      .then((result) => result)
      .catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, userPreferences);
    return util.send(req, res);
  }
}

export default UserPreferencesController;
