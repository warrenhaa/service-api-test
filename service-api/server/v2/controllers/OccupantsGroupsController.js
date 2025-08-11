import Util from '../../utils/Utils';
import ApplicationError from '../../errors/ApplicationError';
import OccupantsGroupsService from '../services/OccupantsGroupsService';
import ErrorCodes from '../../errors/ErrorCodes';

const util = new Util();

class OccupantsGroupsController {
  static async getOccupantGroups(req, res) {
    const { occupant_id } = req;
    const { id, type } = req.query;
    const userid = req.identity_id;
    if (type == 'gateway') {
      const occupantHomeGatewayDetails = await OccupantsGroupsService.getGatewayGroups(id, occupant_id)
        .then((result) => result).catch((err) => {
          throw new ApplicationError(err);
        });
      util.setSuccess(200, occupantHomeGatewayDetails);
    } else if (type == 'location') {
      const occupantHomeSharedLocationDetails = await OccupantsGroupsService.getLocationGroups(id, occupant_id, userid)
        .then((result) => result).catch((err) => {
          throw new ApplicationError(err);
        });
      util.setSuccess(200, occupantHomeSharedLocationDetails);
    }
    return util.send(req, res);
  }

  static async getOccupantGroup(req, res) {
    const { id } = req.query;
    const occupantId = req.occupant_id;
    const companyId = req.company_id;
    const occupantGroups = await OccupantsGroupsService.getOccupantGroup(id, occupantId, companyId)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupantGroups);
    return util.send(req, res);
  }

  static async addOccupantGroup(req, res) {
    const { body } = req;
    const occupantId = req.occupant_id;
    const deviceList = body.devices;
    const source_IP = req.source_IP;
    const occupants = await OccupantsGroupsService.addOccupantGroup(body, occupantId, deviceList, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async putOccupantGroup(req, res) {
    const { id } = req.body;
    const occupantId = req.occupant_id;
    const companyId = req.company_id;
    const source_IP = req.source_IP;
    const occupants = await OccupantsGroupsService.updateOccupantsGroup(id,
      req.body, occupantId, companyId, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async deleteOccupantGroup(req, res) {
    const { id } = req.query;
    const occupantId = req.occupant_id;
    const companyId = req.company_id;
    const source_IP = req.source_IP;
    await OccupantsGroupsService.deleteOccupantGroup(id, occupantId, companyId, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200);
    return util.send(req, res);
  }

  static async addOccupantGroupDevices(req, res) {
    const { group_id, devices } = req.body;
    const occupantId = req.occupant_id;
    const companyId = req.company_id;
    const deviceList = devices;
    const source_IP = req.source_IP;
    const occupants = await OccupantsGroupsService.addOccupantGroupDevices(group_id,
      deviceList, occupantId, companyId, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async deleteOccupantGroupDevices(req, res) {
    const { group_id, devices } = req.body;
    const occupantId = req.occupant_id;
    const companyId = req.company_id;
    const deviceList = devices;
    const source_IP = req.source_IP;
    const occupants = await OccupantsGroupsService.deleteOccupantGroupDevices(group_id,
      deviceList, occupantId, companyId, deviceList, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }
}

export default OccupantsGroupsController;
