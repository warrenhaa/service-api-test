import Util from '../../utils/Utils';
import ApplicationError from '../../errors/ApplicationError';
import OccupantsPermissionsService from '../services/OccupantsPermissionsService';
import OccupantsPermissionsMetadataService from '../services/OccupantsPermissionsMetadataService';
import { DPCommands } from '../../utils/constants/DeviceProvisionCommands';

const util = new Util();

class OccupantsPermissionsController {
  static async getOccupantsPermissions(req, res) {
    const { gateway_id, gateway_code } = req.query;
    const { company_id } = req.body;
    const { occupant_id, user_id } = req;
    const { isAdmin } = req.header;

    const occupants = await OccupantsPermissionsService.getOccupantsPermissions(gateway_id, company_id, occupant_id, gateway_code, user_id, isAdmin)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async addOccupantsPermissions(req, res) {
    const { body } = req;
    const { company_id } = req.body;
    const { occupant_id } = req;
    const accessToken = req.headers['x-access-token'];
    const source_IP = req.source_IP;
    const occupants = await OccupantsPermissionsService.addOccupantsPermissions(body, company_id, occupant_id, accessToken, req.occupantDetails.identity_id, req.request_id, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async putOccupantsPermissions(req, res) {
    const { id } = req.query;
    const { body } = req;
    const { occupant_id } = req;
    const { company_id } = req.body;
    const source_IP = req.source_IP;
    const occupants = await OccupantsPermissionsService.updateOccupantsPermissions(id, body, occupant_id, company_id, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async resendOccupantsPermissions(req, res) {
    const { id } = req.body;
    const { occupant_id } = req;
    const { company_id } = req.body;
    const source_IP = req.source_IP;
    const occupants = await OccupantsPermissionsService.resendOccupantsPermissions(id, occupant_id, company_id, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async deleteOccupantsPermissions(req, res) {
    const { id } = req.query;
    const { occupant_id } = req;
    const { company_id } = req.body;
    const accessToken = req.headers['x-access-token'];
    const occupant_email = req.occupantDetails.email;
    const calledByAPI = true;
    const source_IP = req.source_IP;
    const occupants = await OccupantsPermissionsService.deleteOccupantsPermissions(id, occupant_id, company_id, accessToken, req.occupantDetails.identity_id, DPCommands.unshare, occupant_email, calledByAPI, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200);
    return util.send(req, res);
  }

  static async addOccupantsPermissionsMetadata(req, res) {
    const { company_id, key, value, occupant_permission_id } = req.body;
    const { occupant_id } = req;
    const source_IP = req.source_IP;
    const occupants = await OccupantsPermissionsMetadataService.addOccupantsPermissionsMetadata(key, value, occupant_permission_id, occupant_id, company_id, source_IP)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async getOccupantsPermissionsMetadata(req, res) {
    const { occupant_id } = req;
    const { occupant_permission_id } = req.query;
    const occupants = await OccupantsPermissionsMetadataService.getOccupantsPermissionsMetadata(occupant_permission_id, occupant_id,)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async disableGeofencing(req, res) {
    const { occupant_id } = req;
    const { occupant_permission_id, gateway_id } = req.query;
    const { company_id } = req.body;
    const occupants = await OccupantsPermissionsMetadataService.disableGeofencing(occupant_permission_id, occupant_id, company_id, gateway_id)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }
}
export default OccupantsPermissionsController;
