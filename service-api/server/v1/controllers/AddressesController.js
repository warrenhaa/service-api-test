import AddressesService from '../services/AddressesService';
import Util from '../../utils/Utils';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';

const util = new Util();

class AddressesController {
  static async createAddress(req, res) {
    const addresses = await AddressesService.createAddress(req.body, req).catch(() => {
      const err = ErrorCodes['600000'];
      throw new ApplicationError(err);
    });
    util.setSuccess(200, addresses);
    return util.send(req, res);
  }

  static async getAllAddresses(req, res) {
    const addresses = await AddressesService.getAllAddresses(req);
    if (addresses.length > 0) {
      util.setSuccess(200, addresses);
    } else {
      const err = ErrorCodes['600001'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getAddress(req, res) {
    const { id } = req.params;
    const address = await AddressesService.getAddress(id);
    if (address) {
      util.setSuccess(200, address);
    } else {
      const err = ErrorCodes['600002'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async deleteAddress(req, res) {
    const { id } = req.params;
    const addresses = await AddressesService.deleteAddress(id, req);
    if (addresses) {
      util.setSuccess(200);
    } else {
      const err = ErrorCodes['600003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async updateAddress(req, res) {
    const { id } = req.params;
    const updatedAddress = await AddressesService.updateAddress(req.body, id, req);
    if (updatedAddress && updatedAddress.length > 0) {
      util.setSuccess(200, updatedAddress[1][0]);
    } else {
      const err = ErrorCodes['600004'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }
}

export default AddressesController;
