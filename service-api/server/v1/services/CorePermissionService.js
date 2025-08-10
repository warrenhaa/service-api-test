import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';

class CorePermissionService {
  static async getAllCorePermissions(req) {
    const corePermission = await database.core_permissions.findAll({
      where: {
        company_id: req.body.company_id,
      },
    });
    return corePermission;
  }

  static async getACorePermission(req) {
    const corePermission = await database.core_permissions.findOne({
      where: {
        company_id: req.body.company_id,
        id: req.params.id,
      },
      raw: true,
    });
    return corePermission;
  }

  static async getCorePermissionsOfUser(req) {
    const corePermissions = await database.core_permissions.findAll({
      where: {
        company_id: req.body.company_id,
        user_id: req.query.user_id,
      },
      include: [
        {
          model: database.core_permissions_mappings,
        },
      ],
      raw: true,
    });
    return corePermissions;
  }

  static async addCorePermissions(body) {
    let newObj = {};
    const userId = body.user_id;
    const companyId = body.company_id;
    const corePermissions = body.permissions.core_permissions;
    const permissionNames = Object.keys(corePermissions);
    const corePermissionAdded = await Promise.all(
      permissionNames.map(async (key) => {
        const fields = corePermissions[key];
        const corePermissionMapId = await database.core_permissions_mappings.findOne(
          {
            where: {
              company_id: companyId,
              name: key,
            },
            attributes: ['id'],
            raw: true,
          },
        );
        let permissions = null;
        if (corePermissionMapId && corePermissionMapId.id) {
          permissions = await Promise.all(
            fields.map(async (element) => {
              const corePermission = await database.core_permissions.create({
                company_id: companyId,
                core_permission_mapping_id: corePermissionMapId.id,
                access_level: element,
                user_id: userId,
                created_by: body.created_by,
                updated_by: body.updated_by,
              });
              return corePermission.toJSON();
            }),
          );
          const new_data = {};
          new_data[key] = fields;
          newObj = new_data;
          const obj = {
            old: {},
            new: newObj,
          };
          ActivityLogs.addActivityLog(Entities.core_permissions.entity_name, Entities.core_permissions.event_name.added,
            obj, Entities.notes.event_name.added, userId, body.company_id, body.user_id, null);
        }
        return permissions;
      }),
    );
    return corePermissionAdded;
  }

  static async deleteACorePermission(req, id) {
    const { body } = req;
    const permissionToDelete = await database.core_permissions.findOne({
      where: { id },
    });
    if (permissionToDelete) {
      const deletedInvite = await database.core_permissions.destroy({
        where: { id },
      });
      const obj = {
        old: permissionToDelete,
        new: {},
      };
      ActivityLogs.addActivityLog(Entities.core_permissions.entity_name, Entities.core_permissions.event_name.deleted,
        obj, Entities.notes.event_name.deleted, id, body.company_id, req.user_id, null);
      return deletedInvite;
    }
    return null;
  }

  static async updateCorePermission(req) {
    let oldObj = {};
    let newObj = {};
    const permissionBody = req.body;
    const companyId = req.body.company_id;
    const userId = permissionBody.user_id;
    let permissions = [];
    const keys = Object.keys(permissionBody.permissions.core_permissions);
    const before_Permissions = [];
    await Promise.all(keys.map(async (key) => {
      const coremappingId = await database.core_permissions_mappings.findOne({
        where: { name: key },
        attributes: ['id'],
        raw: true,
      });
      const getDetails = await database.core_permissions.findAll({
        where: { core_permission_mapping_id: coremappingId.id, user_id: userId },
      });
      getDetails.forEach((data) => {
        const accessLevel = data.access_level;
        if (!before_Permissions.includes(accessLevel)) {
          before_Permissions.push(accessLevel);
        }
      });
      const before_key = key;
      await database.core_permissions.destroy({
        where: { core_permission_mapping_id: coremappingId.id, user_id: userId },
      });
      const fields = permissionBody.permissions.core_permissions[key];
      permissions = await Promise.all(
        fields.map(async (element) => {
          const corePermission = await database.core_permissions.create({
            company_id: companyId,
            core_permission_mapping_id: coremappingId.id,
            access_level: element,
            user_id: userId,
            created_by: userId,
            updated_by: userId,
          });
          return corePermission.toJSON();
        }),
      ).catch(() => null);
      const old_data = {};
      old_data[before_key] = before_Permissions;
      oldObj = old_data;
      const new_data = {};
      new_data[key] = fields;
      newObj = new_data;
      const obj = {
        old: oldObj,
        new: newObj,
      };
      ActivityLogs.addActivityLog(Entities.core_permissions.entity_name, Entities.core_permissions.event_name.updated,
        obj, Entities.notes.event_name.updated, userId, permissionBody.company_id, req.user_id, null);
    }));
    return permissions;
  }
}

export default CorePermissionService;
