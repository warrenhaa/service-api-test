import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';

import {
  setInCache,
  deleteFromCache,
} from '../../cache/Cache';

class CategoryService {
  static async addCategory(req) {
    const cacheKey = `categories${req.body.model}`;
    let categories = await database.categories.findOne({
      where: {
        model: req.body.model,
      },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['510002'];
      throw err;
    });
    if (categories) {
      const update = req.body;
      const updateCategories = await
      database.categories.update(update, {
        where: {
          id: categories.id,
        },
        returning: true,
        raw: true,
      }).then((result) => result).catch(() => {
        const err = ErrorCodes['510003'];
        throw err;
      });
      if (updateCategories) {
        const getCategories = categories;
        categories = await database.categories.findOne({
          where: {
            id: getCategories.id,
          },
        }).then((result) => result).catch(() => {
          const err = ErrorCodes['510002'];
          throw err;
        });

        const obj = {
          old: getCategories,
          new: categories,
        };
        ActivityLogs.addActivityLog(Entities.categories.entity_name,
          Entities.categories.event_name.updated,
          obj, Entities.notes.event_name.updated, req.user_id,
          req.body.company_id, req.user_id);
        await deleteFromCache(cacheKey, req.body.model);
        await setInCache(cacheKey, req.body.model, { categories });
      }
      return categories;
    }
    const name = (req.body.name) ? req.body.name : null;
    const data = (req.body.data) ? req.body.data : null;
    const deviceClass = (req.body.device_class) ? req.body.device_class : null;
    const addCategories = await database.categories.create({
      model: req.body.model,
      category_id: req.body.category_id,
      name,
      data,
      device_class: deviceClass,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['510001'];
      throw err;
    });
    if (addCategories) {
      const obj = {
        old: {},
        new: addCategories,
      };
      ActivityLogs.addActivityLog(Entities.categories.entity_name,
        Entities.categories.event_name.added,
        obj, Entities.notes.event_name.added, req.user_id,
        req.body.company_id, req.user_id);
    }
    await deleteFromCache(cacheKey, req.body.model);
    await setInCache(cacheKey, req.body.model, { addCategories });
    return addCategories;
  }
}

export default CategoryService;
