import Util from '../../utils/Utils';
import ApplicationError from '../../errors/ApplicationError';
import OccupantsDashboardAttributesService from '../services/OccupantsDashboardAttributesService';

const util = new Util();

class OccupantsDashboardAttributesController {
  static async getOccupantsDashboardAttributes(req, res) {
    const occupantId = req.occupant_id;
    const companyId = req.body.company_id;
    const { id, item_id } = req.query;
    const dashboardAttribute = await OccupantsDashboardAttributesService.getOccupantsDashboardAttributes(id, occupantId, companyId, item_id)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, dashboardAttribute);
    return util.send(req, res);
  }

  static async addOccupantsDashboardAttributes(req, res) {
    const { body } = req;
    const { company_id } = req.body;
    const { occupant_id } = req;
    const source_IP = req.source_IP;
    const occupants = await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(body, company_id, occupant_id, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async putOccupantsDashboardAttributes(req, res) {
    const { body } = req;
    const { id } = body;
    const { occupant_id } = req;
    const { company_id } = req.body;
    const source_IP = req.source_IP;
    const occupants = await OccupantsDashboardAttributesService.updateOccupantsDashboardAttributes(id, body, occupant_id, company_id, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async deleteOccupantsDashboardAttributes(req, res) {
    const { id , item_id} = req.query;
    const { occupant_id } = req;
    const { company_id } = req.body;
    const source_IP = req.source_IP;
    const occupants = await OccupantsDashboardAttributesService.deleteOccupantsDashboardAttributes(id, occupant_id, company_id, item_id, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200);
    return util.send(req, res);
  }
}
export default OccupantsDashboardAttributesController;
