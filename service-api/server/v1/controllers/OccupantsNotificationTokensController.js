import Util from '../../utils/Utils';
import ApplicationError from '../../errors/ApplicationError';
import OccupantsNotificationTokensService from '../services/OccupantsNotificationTokensService';

const util = new Util();

class OccupantsNotificationTokensController {
  static async getOccupantsNotificationTokens(req, res) {
    const id = req.occupant_id;
    const { company_id } = req.body;
    const occupants = await OccupantsNotificationTokensService.getOccupantsNotificationTokens(id, company_id)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async addOccupantsNotificationTokens(req, res) {
    const { body } = req;
    const { company_id } = req.body;
    const { occupant_id } = req;
    const source_IP = req.source_IP;
    const occupants = await OccupantsNotificationTokensService.addOccupantsNotificationTokens(body, company_id, occupant_id, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async putOccupantsNotificationTokens(req, res) {
    const { id } = req.body;
    const { body } = req;
    const { occupant_id } = req;
    const { company_id } = req.body;
    const source_IP = req.source_IP;
    const occupants = await OccupantsNotificationTokensService.updateOccupantsNotificationTokens(id, body, occupant_id, company_id, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async deleteOccupantsNotificationTokens(req, res) {
    const { token } = req.query;
    const { occupant_id } = req;
    const { company_id } = req.body;
    const source_IP = req.source_IP;
    const occupants = await OccupantsNotificationTokensService.deleteOccupantsNotificationTokens(token, occupant_id, company_id,source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200);
    return util.send(req, res);
  }
}
export default OccupantsNotificationTokensController;
