import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';

class AdressesService {
  static async createAddress(body, req) {
    const address = await database.addresses.create({
      line_1: body.line_1,
      line_2: body.line_2,
      line_3: body.line_3,
      city: body.city,
      state: body.state,
      country: body.country,
      zip_code: body.zip_code,
      geo_location: body.geo_location,
      total_area: body.total_area,
      company_id: body.company_id,
    });
    const obj = {
      old: {},
      new: address,
    };
    ActivityLogs.addActivityLog(Entities.addresses.entity_name, Entities.addresses.event_name.added,
      obj, Entities.notes.event_name.added, address.id, body.company_id, req.user_id, null, null, req.source_IP);
    return address;
  }

  static async getAllAddresses(req) {
    const addresses = await database.addresses.findAll({
      where: { company_id: req.body.company_id },
    });
    return addresses;
  }

  static async getAddress(id) {
    const address = await database.addresses.findOne({ where: { id } });
    return address;
  }

  static async updateAddress(updatedAddress, id, req) {
    const oldObj = {};
    const newObj = {};
    const { body } = req;
    const addressToUpdate = await database.addresses.findOne({
      where: { id },
    });
    if (addressToUpdate) {
      const updateAddress = await database.addresses.update(updatedAddress, {
        where: { id },
        returning: true,
        raw: true,
      });

      Object.keys(updatedAddress).forEach((key) => {
        if (updatedAddress.hasOwnProperty(key) && JSON.stringify(addressToUpdate[key]) != JSON.stringify(updatedAddress[key])) {
          oldObj[key] = addressToUpdate[key];
          newObj[key] = updatedAddress[key];
        }
      });
      const obj = {
        old: oldObj,
        new: newObj,
      };
      ActivityLogs.addActivityLog(Entities.addresses.entity_name, Entities.addresses.event_name.updated,
        obj, Entities.notes.event_name.updated, id, body.company_id, req.user_id, null, null, req.source_IP);
      return updateAddress;
    }
    return null;
  }

  static async deleteAddress(id, req) {
    const { body } = req;
    const addressToDelete = await database.addresses.findOne({ where: { id } });
    if (addressToDelete) {
      const deleteAddress = await database.addresses.destroy({
        where: { id },
      });
      const obj = {
        old: addressToDelete,
        new: {},
      };
      ActivityLogs.addActivityLog(Entities.addresses.entity_name, Entities.addresses.event_name.deleted,
        obj, Entities.notes.event_name.deleted, id, body.company_id, req.user_id, null, null, req.source_IP);
      return deleteAddress;
    }
    return null;
  }
}

export default AdressesService;
