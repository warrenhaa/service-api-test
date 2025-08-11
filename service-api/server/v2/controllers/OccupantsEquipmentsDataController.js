import Util from '../../utils/Utils';
import ApplicationError from '../../errors/ApplicationError';
import OccupantsEquipmentsDataService from '../services/OccupantsEquipmentsDataService';

const util = new Util();

class OccupantsEquipmentsDataController {
  static async getOccupantsEquipmentsData(req, res) {
    const {id} = req.query;
    console.log("🚀 ~ file: occupantsEquipmentsDataController.js:10 ~ OccupantsEquipmentsDataController ~ getOccupantsEquipmentsData ~ id:", id)
    const equipmentsData = await OccupantsEquipmentsDataService.getOccupantsEquipmentsData(
      id)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, equipmentsData);
    return util.send(req, res);
  }

  static async addOccupantsEquipmentsData(req, res) {
    const { body } = req;
    const { company_id } = req.body;
    const { occupant_id } = req;
    const source_IP = req.source_IP;
    const equipmentsData = await OccupantsEquipmentsDataService.addOccupantsEquipmentsData(
      body, company_id, occupant_id, source_IP).then(async (result) => result).catch((e) => {
      const err = e;
      throw new ApplicationError(err);
    });
    util.setSuccess(200, equipmentsData);
    return util.send(req, res);
  }

  static async getOccupantsEquipmentsDataList(req, res) {
    const {token} = req.query;
    const { occupant_id } = req;
    const equipmentsData = await OccupantsEquipmentsDataService.getOccupantsEquipmentsDataList(
      token, occupant_id)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, equipmentsData);
    return util.send(req, res);
  }

  static async deleteOccupantsEquipmentsData(req, res) {
    const {id} = req.query;
    const { company_id } = req.body;
    const { occupant_id } = req;
    const source_IP = req.source_IP;
    const equipmentsData = await OccupantsEquipmentsDataService.deleteOccupantsEquipmentsData(id,
      occupant_id, company_id, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, equipmentsData);
    return util.send(req, res);
  }
}
export default OccupantsEquipmentsDataController;
