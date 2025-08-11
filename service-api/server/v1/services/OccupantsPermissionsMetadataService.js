import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import OccupantPermissionsService from './OccupantsPermissionsService';

class OccupantsPermissionsMetadataService {
  static async addOccupantsPermissionsMetadata(key, value, occupant_permission_id, occupant_id, companyId, source_IP) {
    const occupantsPermissions = await OccupantPermissionsService
      .getDataOccupantsPermissions(occupant_permission_id)
      .then((result) => result).catch(() => {
        const err = ErrorCodes['160026'];
        throw err;
      });
    if (occupantsPermissions) {
      if (occupant_id != occupantsPermissions.receiver_occupant_id) {
        const err = ErrorCodes['160045'];
        throw err;
      }
    } else {
      const err = ErrorCodes['160045'];
      throw err;
    }
    let OccupantsPermissionsMetadata = await database.occupants_permissions_metadata.findOne({
      where: {
        key,
        occupant_permission_id,
      },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160056'];
      throw err;
    });
    if (OccupantsPermissionsMetadata) {
      const update = {
        key,
        value,
      };
      const updatePermissionsMetadata = await
      database.occupants_permissions_metadata.update(update, {
        where: {
          id: OccupantsPermissionsMetadata.id,
        },
        returning: true,
        raw: true,
      }).then((result) => result).catch(() => {
        const err = ErrorCodes['160057'];
        throw err;
      });
      if (updatePermissionsMetadata) {
        const getPermissionsMetadata = OccupantsPermissionsMetadata;
        OccupantsPermissionsMetadata = await database.occupants_permissions_metadata.findOne({
          where: {
            key,
            occupant_permission_id,
          },
          raw: true,
        }).then((result) => result).catch(() => {
          const err = ErrorCodes['160056'];
          throw err;
        });
        let objOld = {};
        let objNew = {};
        const keyOld = {};
        const keyNew = {};
        Object.keys(update).forEach((ele) => {
          if (ele === 'key') {
            keyOld[ele] = getPermissionsMetadata[ele];
            keyNew[ele] = OccupantsPermissionsMetadata[ele];
          }
          if (JSON.stringify(getPermissionsMetadata[ele])
            !== JSON.stringify(OccupantsPermissionsMetadata[ele])) {
            objOld[ele] = getPermissionsMetadata[ele];
            objNew[ele] = OccupantsPermissionsMetadata[ele];
            objOld = Object.assign(objOld, keyOld);
            objNew = Object.assign(objNew, keyNew);
          }
        });
        const obj = {
          old: objOld,
          new: objNew,
        };
        ActivityLogs.addActivityLog(Entities.occupants_permissions_metadata.entity_name,
          Entities.occupants_permissions_metadata.event_name.updated,
          obj, Entities.notes.event_name.updated, occupant_permission_id,
          companyId, null, occupant_id, null, source_IP);
      }
    } else {
      const addOccupantsPermissionsMetadata = await database.occupants_permissions_metadata.create({
        key,
        value,
        occupant_permission_id,
      }).then((result) => result).catch(() => {
        const err = ErrorCodes['160054'];
        throw err;
      });
      if (addOccupantsPermissionsMetadata) {
        const obj = {
          old: {},
          new: addOccupantsPermissionsMetadata,
        };
        ActivityLogs.addActivityLog(Entities.occupants_permissions_metadata.entity_name,
          Entities.occupants_permissions_metadata.event_name.added,
          obj, Entities.notes.event_name.added, occupant_permission_id,
          companyId, null, occupant_id, null, source_IP);
      }
    }
    OccupantsPermissionsMetadata = await database.occupants_permissions_metadata.findAll({
      where: {
        occupant_permission_id,
      },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160056'];
      throw err;
    });

    return OccupantsPermissionsMetadata;
  }

  static async getOccupantsPermissionsMetadata(occupant_permission_id, occupant_id) {
    const occupantsPermissions = await
    OccupantPermissionsService.getDataOccupantsPermissions(occupant_permission_id)
      .then((result) => result).catch(() => {
        const err = ErrorCodes['160026'];
        throw err;
      });
    if (occupantsPermissions) {
      if (occupant_id != occupantsPermissions.receiver_occupant_id) {
        const err = ErrorCodes['160045'];
        throw err;
      }
    } else {
      const err = ErrorCodes['160045'];
      throw err;
    }
    const OccupantsPermissionsMetadata = await database.occupants_permissions_metadata.findAll({
      where: { occupant_permission_id },
    }).then((result) => (result)).catch((error) => {
      const err = ErrorCodes['160056'];
      throw err;
    });
    return OccupantsPermissionsMetadata;
  }
}

export default OccupantsPermissionsMetadataService;
