import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';

class ModelsService {
  static async checkModelExists(req) {
    const checkModel = await database.models.findOne({
      where: {
        company_id: req.body.company_id,
        name: req.body.name,
      },
    }).then((result) => result);
    if (checkModel) {
      return true;
    }
    return false;
  }

  static async addModel(req) {
    const { body } = req;
    const checkModel = await database.models.findOne({
      where: {
        company_id: req.body.company_id,
        name: req.body.name,
      },
    }).then((result) => result);
    if (checkModel) {
      const err = ErrorCodes['130000'];
      throw err;
    } else {
      const addModel = await database.models.create({
        company_id: req.body.company_id,
        name: req.body.name,
        description: req.body.description,

      }).then((result) => result);
      const obj = {
        old: {},
        new: addModel,
      };
      ActivityLogs.addActivityLog(Entities.models.entity_name, Entities.models.event_name.added,
        obj, Entities.notes.event_name.added, addModel.id, body.company_id, req.user_id, null);
      return addModel;
    }
  }

  static async editModel(req) {
    const oldObj = {};
    const newObj = {};
    const checkModel = await database.models.findOne({
      where: {
        company_id: req.body.company_id,
        id: req.body.model_id,
      },
    }).then((result) => result);
    if (!checkModel) {
      const err = ErrorCodes['130001'];
      throw err;
    } else if (req.body.name && checkModel.dataValues.name !== req.body.name) {
      const result = await this.checkModelExists(req);
      if (result) {
        const err = ErrorCodes['130000'];
        throw err;
      }
    }
    const body = { ...req.body };
    delete body.model_id;
    delete body.company_id;
    const editModel = await database.models.update(
      body,
      {
        where: {
          id: req.body.model_id,
        },
      },
    ).then((result) => result);
    const getModel = await database.models.findOne({
      where: {
        id: req.body.model_id,
      },
      raw: true,
    }).then((result) => result);
    Object.keys(body).forEach((key) => {
      if (JSON.stringify(checkModel[key]) != JSON.stringify(body[key])) {
        oldObj[key] = checkModel[key];
        newObj[key] = body[key];
      }
    });
    const obj = {
      old: oldObj,
      new: newObj,
    };
    ActivityLogs.addActivityLog(Entities.models.entity_name, Entities.models.event_name.updated,
      obj, Entities.notes.event_name.updated, checkModel.id, req.body.company_id, req.user_id, null);
    return getModel;
  }

  static async getModels(req) {
    const getModels = await database.models.findAll({
      where: {
        company_id: req.body.company_id,
      },
      raw: true,
    }).then((result) => result);
    return getModels;
  }

  static async deleteModel(req) {
    const { body } = req;
    const checkModel = await database.models.findOne({
      where: {
        company_id: req.body.company_id,
        id: req.params.id,
      },
    }).then((result) => result);
    if (!checkModel) {
      const err = ErrorCodes['130001'];
      throw err;
    } else {
      const deleteModels = await database.models.destroy({
        where: {
          id: req.params.id,
        },
      }).then((result) => result);
    }
    const obj = {
      old: checkModel,
      new: {},
    };
    ActivityLogs.addActivityLog(Entities.models.entity_name, Entities.models.event_name.deleted,
      obj, Entities.notes.event_name.deleted, checkModel.id, body.company_id, req.user_id, null);
    return {};
  }

  static async getModel(req) {
    const getModel = await database.models.findOne({
      where: {
        name: req.body.name,
        company_id: req.body.company_id,
      },
    }).then((result) => result);
    return getModel;
  }
}

export default ModelsService;
