import OccupantService from '../services/OccupantService';
import Util from '../../utils/Utils';
import ApplicationError from '../../errors/ApplicationError';
import ErrorCodes from '../../errors/ErrorCodes';
import OccupantDeviceAlertsService from '../services/OccupantDeviceAlertsService';
import OccupantRegisterService from '../services/OccupantRegisterService';
const util = new Util();

class OccupantsController {
  static async addOccupantInvitation(req, res) {
    const invite = await OccupantService.addOccupantInvitation(
      req,
    ).then(async (result) => result).catch((e) => {
      const err = e;
      throw new ApplicationError(err);
    });
    util.setSuccess(200, invite);
    return util.send(req, res);
  }

  static async resendOccupantInvitation(req, res) {
    const { id } = req.params;
    const updateInvitation = await OccupantService.resendOccupantInvitation(
      id,
      req,
    ).catch((err) => {
      const error = err;
      throw (error);
    });
    if (!updateInvitation) {
      const err = ErrorCodes['160005'];
      throw new ApplicationError(err);
    } else {
      await OccupantService.getinvite(req)
        .catch(() => {
          const err = ErrorCodes['160000'];
          throw new ApplicationError(err);
        });
      util.setSuccess(200, updateInvitation);
    }
    return util.send(req, res);
  }

  static async expireInvitation(req, res) {
    const updateInvite = await OccupantService.expireInvitation(req);
    if (!updateInvite) {
      util.setSuccess(200, []);
    } else {
      util.setSuccess(200, updateInvite);
    }
    return util.send(req, res);
  }

  static async editInviteLocation(req, res) {
    const { id } = req.params;
    const updateInvite = await OccupantService.editInviteLocation(id, req)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, updateInvite);
    return util.send(req, res);
  }

  static async deleteOccupantInvite(req, res) {
    const { id, email } = req.params;
    const inviteToDelete = await OccupantService.deleteOccupantInvite(id, req, email);
    if (inviteToDelete) {
      util.setSuccess(200);
    } else {
      const err = ErrorCodes['160006'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getAllOccupants(req, res) {
    const occupants = await OccupantService.getAllOccupants(req)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async addOccupants(req, res) {
    //console.log("🚀 ~ file: occupantsController.js:100 ~ occupantsController ~ addOccupants ~ req:", req.body)
    const occupants = await OccupantService.addOccupants(req)
      .then(async (result) => result).catch((e) => {
        //add to queue
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async editOccupants(req, res) {
    const occupants = await OccupantService.editOccupants(req);
    if (occupants) {
      util.setSuccess(200, occupants);
    } else {
      const err = ErrorCodes['160007'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async deleteOccupant(req, res) {
    const { id } = req.query;
    const occupantToDelete = await OccupantService.deleteOccupant(req, id);
    if (occupantToDelete) {
      util.setSuccess(200, occupantToDelete);
    } else {
      const err = ErrorCodes['160008'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async deleteConfirmation(req, res) {
    const { id } = req.query;
    const occupantToDelete = await OccupantService.deleteConfirmation(req, id);
    if (occupantToDelete) {
      util.setSuccess(200, occupantToDelete);
    } else {
      const err = ErrorCodes['160008'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async occupantCheckIn(req, res) {
    const occupantCheckIn = await OccupantService.occupantCheckIn(req)
      .then((result) => result)
      .catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, occupantCheckIn);
    return util.send(req, res);
  }

  static async occupantCheckOut(req, res) {
    const occupantCheckOut = await OccupantService.occupantCheckOut(req)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, occupantCheckOut);
    return util.send(req, res);
  }

  static async getOccupantSliderList(req, res) {
    const { occupant_id, company_id } = req;
    if(process.env.ALLOW_WITHOUT_OCCUPANT != true &&  process.env.ALLOW_WITHOUT_OCCUPANT != "true"){
      const occupantDashboard = await OccupantService.getOccupantSliderList(occupant_id, company_id)
      .then(async (result) => result).catch((err) => {
        throw new ApplicationError(err);
      });
      util.setSuccess(200, occupantDashboard);
    }else{
      util.setSuccess(200, []);
    }
   
    return util.send(req, res);
  }

  static async getOccupantSliderDetails(req, res) {
    const { occupant_id, company_id } = req;
    const { isAdmin } = req.header;

    const { id, type, gateway_code, req_occupant_id } = req.query;
    const { identity_id } = req;

    if(!type && isAdmin == true)
    {
      type = 'admin';
    }

    if (type == 'gateway') {
      const occupantHomeGatewayDetails = await OccupantService.getSliderGatewayDetails(id, occupant_id, company_id)
        .then(async (result) => result).catch((err) => {
          throw new ApplicationError(err);
        });
      util.setSuccess(200, occupantHomeGatewayDetails);
    } else if (type == 'admin') {
      const occupantHomeGatewayDetails = await OccupantService.getAdminSliderGatewayDetails(gateway_code, req_occupant_id, company_id)
        .then(async (result) => result).catch((err) => {
          throw new ApplicationError(err);
        });
      // console.log("occupantHomeGatewayDetails",occupantHomeGatewayDetails)
      util.setSuccess(200, occupantHomeGatewayDetails);
    } else if (type == 'location') {
      const occupantHomeSharedLocationDetails = await OccupantService.getSliderSharedLocationDetails(id, occupant_id, identity_id, company_id)
        .then(async (result) => result).catch((err) => {
          throw new ApplicationError(err);
        });
      util.setSuccess(200, occupantHomeSharedLocationDetails);
    } else if (type == 'camera_dashboard') {
      // id here is occupant_id
      const occupantHomeCameraDetails = await OccupantService.getSliderCameraDetails(id, company_id)
        .then(async (result) => result).catch((err) => {
          throw new ApplicationError(err);
        });
      util.setSuccess(200, occupantHomeCameraDetails);
    }
    return util.send(req, res);
  }

  static async getOccupantUnGroupedList(req, res) {
    const { occupant_id, company_id } = req;
    const { id, type } = req.query;
    const userid = req.identity_id;
    if (type == 'gateway') {
      const occupantHomeGatewayDetails = await OccupantService.getUnGroupedGatewayDevicesList(id, occupant_id)
        .then(async (result) => result).catch((err) => {
          throw new ApplicationError(err);
        });
      util.setSuccess(200, occupantHomeGatewayDetails);
    } else if (type == 'location') {
      const occupantHomeSharedLocationDetails = await OccupantService.getUnGroupedLocationDevicesList(id, occupant_id, userid, company_id)
        .then(async (result) => result).catch((err) => {
          // console.log(err);
          throw new ApplicationError(err);
        });
      util.setSuccess(200, occupantHomeSharedLocationDetails);
    }
    return util.send(req, res);
  }

  static async getOccupantCategoryList(req, res) {
    const { occupant_id, company_id } = req;
    const { id, type } = req.query;
    const userid = req.identity_id;
    if (type == 'gateway') {
      const occupantHomeGatewayDetails = await OccupantService.getGatewayCategories(id, occupant_id)
        .then(async (result) => result).catch((err) => {
          throw new ApplicationError(err);
        });
      util.setSuccess(200, occupantHomeGatewayDetails);
    } else if (type == 'location') {
      const occupantHomeSharedLocationDetails = await OccupantService.getLocationCategories(id, occupant_id, userid, company_id)
        .then(async (result) => result).catch((err) => {
          // console.log(err);
          throw new ApplicationError(err);
        });
      util.setSuccess(200, occupantHomeSharedLocationDetails);
    }
    return util.send(req, res);
  }

  static async getOccupantProfile(req, res) {
    const { occupant_id, company_id } = req;
    const occupantDashboard = await OccupantService.getOccupantProfile(occupant_id, company_id)
      .then(async (result) => result).catch((err) => {
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupantDashboard);
    return util.send(req, res);
  }

  static async getOccupantAlerts(req, res) {
    const { company_id } = req;
    const { id } = req.query;
    const occupants = await OccupantDeviceAlertsService.getOccupantAlerts(id, company_id)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async getOccupantDeviceAlertsCount(req, res) {
    const occupants = await OccupantDeviceAlertsService.getOccupantDeviceAlertsCount(req)
      .then(async (result) => result).catch((e) => {
        const err = e;
        throw new ApplicationError(err);
      });
    util.setSuccess(200, occupants);
    return util.send(req, res);
  }

  static async signUp(req, res) {
    const {
      email, password, first_name, last_name, phone_number, country, language, company_id, metadata,
    } = req.body;
    const attributes = await OccupantRegisterService.signUp(email, password, first_name, last_name, phone_number, country, language, company_id, metadata)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, attributes);
    return util.send(req, res);
  }

  static async verify(req, res) {
    const { email, code, company_id } = req.body;
    const attributes = await OccupantRegisterService.verify(email, code, company_id)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, attributes);
    return util.send(req, res);
  }

  static async signIn(req, res) {
    const { email, password, company_id } = req.body;
    const attributes = await OccupantRegisterService.signIn(req, email, password, company_id)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, attributes);
    return util.send(req, res);
  }

  static async passwordReset(req, res) {
    const { email, company_id } = req.body;
    const attributes = await OccupantRegisterService.passwordReset(email, company_id)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, attributes);
    return util.send(req, res);
  }

  static async passwordChanged(req, res) {
    const { company_id } = req.body;
    const { email} = req.headers
    const attributes = await OccupantRegisterService.passwordChanged(email, company_id)
      .then((result) => result).catch((e) => {
        const err = e;
        throw (err);
      });
    util.setSuccess(200, attributes);
    return util.send(req, res);
  }
}

export default OccupantsController;
