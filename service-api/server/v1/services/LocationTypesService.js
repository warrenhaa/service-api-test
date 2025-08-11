import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';

class LocationTypesService {
  static async createLocationType(body, req) {
    const locationTypes = await database.location_types.create({
      company_id: body.company_id,
      name: body.name,
      line_3: body.line_3,
      container_id: body.container_id,
      can_have_devices: body.can_have_devices,
      is_address_applicable: body.is_address_applicable,
      is_location_map_applicable: body.is_location_map_applicable,
    });
    const obj = {
      old: {},
      new: locationTypes,
    };
    ActivityLogs.addActivityLog(Entities.location_types.entity_name, Entities.location_types.event_name.added,
      obj, Entities.notes.event_name.added, locationTypes.id, body.company_id, req.user_id, null, null, req.source_IP);
    return locationTypes;
  }

  static async getLocationTypeByName(name) {
    const locationType = await database.location_types.findOne({ where: { name } });
    return locationType;
  }

  static async getAllLocationTypes(id) {
    const locationTypes = await database.location_types.findAll({
      where: {
        company_id: id,
      },
    });
    return locationTypes;
  }

  static async getLocationType(id) {
    const locationType = await database.location_types.findOne({ where: { id } });
    return locationType;
  }

  static async updateLocationType(updatedLocationType, id, req) {
    const oldObj = {};
    const newObj = {};
    const locationTypeToUpdate = await database.location_types.findOne({
      where: { id },
    });
    if (locationTypeToUpdate) {
      const updateLocationType = await database.location_types.update(updatedLocationType, {
        where: { id },
        returning: true,
        plain: true,
      }).then((result) => result[1].dataValues);
      Object.keys(updatedLocationType).forEach((key) => {
        if (JSON.stringify(locationTypeToUpdate[key]) != JSON.stringify(updatedLocationType[key])) {
          oldObj[key] = locationTypeToUpdate[key];
          newObj[key] = updatedLocationType[key];
        }
      });
      const obj = {
        old: oldObj,
        new: newObj,
      };
      ActivityLogs.addActivityLog(Entities.location_types.entity_name, Entities.location_types.event_name.updated,
        obj, Entities.notes.event_name.updated, id, updatedLocationType.company_id, req.user_id, null, null, req.source_IP);
      return updateLocationType;
    }
    return null;
  }

  static async deleteLocationType(id, req) {
    const locationType = await database.location_types.findOne({ where: { id } });
    if (locationType) {
      const deleteLocationType = await database.location_types.destroy({
        where: { id },
      });
      const obj = {
        old: locationType,
        new: {},
      };
      ActivityLogs.addActivityLog(Entities.location_types.entity_name, Entities.location_types.event_name.deleted,
        obj, Entities.notes.event_name.deleted, id, req.company_id, req.user_id, null, null, req.source_IP);
      return deleteLocationType;
    }
    return null;
  }
}

export default LocationTypesService;
