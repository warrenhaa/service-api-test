import ModelsService from '../services/ModelsService';
import Util from '../../utils/Utils';
import ApplicationError from '../../errors/ApplicationError';

const util = new Util();
class ModelsController {
  static async createModel(req, res) {
    const models = await ModelsService.addModel(req).then(async (result) => result).catch((e) => {
      // console.log(e);
      const err = e;
      throw new ApplicationError(err);
    });
    util.setSuccess(200, models);
    return util.send(req, res);
  }

  static async updateModel(req, res) {
    const models = await ModelsService.editModel(req).then(async (result) => result).catch((e) => {
      const err = e;
      throw new ApplicationError(err);
    });
    util.setSuccess(200, models);
    return util.send(req, res);
  }

  static async getModels(req, res) {
    const models = await ModelsService.getModels(req).then(async (result) => result).catch((e) => {
      const err = e;
      throw new ApplicationError(err);
    });
    util.setSuccess(200, models);
    return util.send(req, res);
  }

  static async deleteModel(req, res) {
    const models = await ModelsService.deleteModel(req)
      .then(async (result) => result)
      .catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, models);
    return util.send(req, res);
  }
}

export default ModelsController;
