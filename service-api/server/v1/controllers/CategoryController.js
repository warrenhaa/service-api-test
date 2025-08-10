import Util from '../../utils/Utils';
import CategoryService from '../services/CategoryService';

const util = new Util();

class CategoryController {
  static async addCategory(req, res) {
    const status = await CategoryService.addCategory(req).catch((error) => {
      throw error;
    });
    util.setSuccess(200, status);
    return util.send(req, res);
  }
}

export default CategoryController;
