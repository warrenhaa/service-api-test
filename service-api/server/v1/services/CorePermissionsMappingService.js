import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';

class CorePermissionsMappingsService {
  static async getCorePermissionMappings(query) {
    const corePermissionMappings = await database.core_permissions_mappings.findOne({
      where: query,
      raw: true,
    });
    return corePermissionMappings;
  }

  static async getAllCorePermissionMappings(body) {
    const corePermissionMappings = await database.core_permissions_mappings.findAll({
      where: {
        company_id: body.company_id,
      },
    });
    return corePermissionMappings;
  }

  static async addCorePermissionsMapping(body, req) {
    const corePermissionMapping = await database.core_permissions_mappings.create(
      {
        name: body.name,
        company_id: body.company_id,
        created_by: req.user_id,
        updated_by: req.user_id,
        access_levels: body.access_levels,
      },
    ).catch((err) => err);
    const obj = {
      old: {},
      new: corePermissionMapping,
    };
    ActivityLogs.addActivityLog(Entities.corepermissions_mappings.entity_name, Entities.corepermissions_mappings.event_name.added,
      obj, Entities.notes.event_name.added, corePermissionMapping.id, body.company_id, req.user_id, null, req.source_IP);
    return corePermissionMapping;
  }

  static async deleteCorePermissionsMapping(req) {
    const { body } = req;
    const permissionToDelete = await database.core_permissions_mappings.findOne({
      where: { id: req.params.id, company_id: req.body.company_id },
    });
    if (permissionToDelete) {
      const deletedInvite = await database.core_permissions_mappings.destroy({
        where: { id: req.params.id },
      });
      const obj = {
        old: permissionToDelete,
        new: {},
      };
      ActivityLogs.addActivityLog(Entities.corepermissions_mappings.entity_name, Entities.corepermissions_mappings.event_name.deleted,
        obj, Entities.notes.event_name.deleted, permissionToDelete.id, body.company_id, req.user_id, null, req.source_IP);
      return deletedInvite;
    }
    return null;
  }

  static async updateCorePermissionsMapping(req) {
    const oldObj = {};
    const newObj = {};
    const { body } = req;
    const updateValue = req.body;
    let updatedPermission = null;
    const permissionToUpdate = await database.core_permissions_mappings.findOne({
      where: { id: req.params.id, company_id: req.body.company_id },
    });
    if (permissionToUpdate) {
      updatedPermission = await database.core_permissions_mappings.update(updateValue,
        {
          where: { id: req.params.id },
          returning: true,
          plain: true,
        }).then((result) => {
        const updatedValue = result[1].dataValues;
        const mappingId = updatedValue.id;
        const permissionDict = {};
        permissionDict.mappingId = mappingId;
        return result[1].dataValues;
      }).catch((err) => err);
      Object.keys(updateValue).forEach((key) => {
        if (JSON.stringify(permissionToUpdate[key]) != JSON.stringify(updateValue[key])) {
          oldObj[key] = permissionToUpdate[key];
          newObj[key] = updateValue[key];
        }
      });
      const obj = {
        old: oldObj,
        new: newObj,
      };
      ActivityLogs.addActivityLog(Entities.corepermissions_mappings.entity_name, Entities.corepermissions_mappings.event_name.updated,
        obj, Entities.notes.event_name.updated, permissionToUpdate.id, body.company_id, req.user_id, null, req.source_IP);
      return updatedPermission;
    }
    return null;
  }
}

export default CorePermissionsMappingsService;
