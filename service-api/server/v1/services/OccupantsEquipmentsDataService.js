import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';

class OccupantsEquipmentsDataService {
  static async getOccupantsEquipmentsData(id) {
    const equipmentsData = await database.occupants_equipments_data.findOne({
      where: { id },
    }).then((result) => {
      if (!result) {
        return ({});
      }
      return (result);
    }).catch((e) => {
      const err = ErrorCodes['160068'];
      throw err;
    });
    return equipmentsData;
  }

  static async getOccupantsEquipmentsDataList(token, occupant_id) {
    const notificationTokens = await database.occupants_notification_tokens.findOne({
      where: {
        token,
        occupant_id,
      },
    }).then((result) => result).catch((e) => {
      const err = ErrorCodes['160024'];
      throw err;
    });

    if (!notificationTokens) {
      const err = ErrorCodes['160024'];
      throw err;
    }
    const equipmentsData = await database.occupants_equipments_data.findAll({
      where: {
        notification_token_id: notificationTokens.id
      },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160068'];
      throw err;
    });
    return { "token_data": notificationTokens, "equipment_data": equipmentsData };
  }

  static async addOccupantsEquipmentsData(body, companyid, occupant_id) {
    if (body.type == 'camera') {
      const camera = await database.camera_devices.findOne({
        where: {
          id: body.item_id,
          occupant_id,
        },
        raw: true,
      }).then((result) => result).catch((err) => {
        throw err;
      });
      if (!camera) {
        const cameraPermissions = await database.occupants_permissions.findOne({
          include: [
            {
              model: database.occupants_camera_permissions,
              where: {
                camera_device_id: body.item_id,
              }
            },
          ],
          where: {
            receiver_occupant_id: occupant_id,
          },
        }).then((result) => result).catch((err) => {
          throw err;
        });
        if (!cameraPermissions) {
          const err = ErrorCodes['460000'];
          throw err;
        }
      }
    }
    if (body.type == 'device') {
      const device = await database.devices.findOne({
        where: {
          id: body.item_id,
        },
        raw: true,
      }).then((result) => result).catch((err) => {
        throw err;
      });
      if (!device) {
        const err = ErrorCodes['800019'];
        throw err;
      }
    }
    const notificationTokens = await database.occupants_notification_tokens.findOne({
      where: {
        token: body.token,
        occupant_id,
      },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160024'];
      throw err;
    });

    if (!notificationTokens) {
      const err = ErrorCodes['160024'];
      throw err;
    }
    const equipmentsData = await database.occupants_equipments_data.findOne({
      where: {
        notification_token_id: notificationTokens.id,
        occupant_id,
        type: body.type,
        item_id: body.item_id,
      },
      raw: true,
    }).then((result) => result).catch((e) => {
      const err = ErrorCodes['160068'];
      throw err;
    });
    let addEquipmentsData = {};
    if (!equipmentsData) {
      addEquipmentsData = await database.occupants_equipments_data.create({
        notification_token_id: notificationTokens.id,
        occupant_id,
        type: body.type,
        item_id: body.item_id,
        value: body.value,
      }).catch((e) => {
        const err = ErrorCodes['160063'];
        throw err;
      });

      const Obj = {
        old: {},
        new: addEquipmentsData,
      };
      if (addEquipmentsData) {
        ActivityLogs.addActivityLog(Entities.occupants_equipments_data.entity_name,
          Entities.occupants_equipments_data.event_name.added,
          Obj, Entities.notes.event_name.added, occupant_id, companyid, null, occupant_id, null);
      }
    } else {
      addEquipmentsData = await database.occupants_equipments_data.update({
        value: body.value,
      },
        {
          where: {
            id: equipmentsData.id,
          },
          returning: true,
          raw: true,
        }).then((result) => (result[1])).catch(() => {
          const err = ErrorCodes['160064'];
          throw err;
        });

      const Obj = {
        old: equipmentsData,
        new: addEquipmentsData,
      };
      if (addEquipmentsData) {
        ActivityLogs.addActivityLog(Entities.occupants_equipments_data.entity_name,
          Entities.occupants_equipments_data.event_name.updated,
          Obj, Entities.notes.event_name.updated, occupant_id, companyid, null, occupant_id, null);
      }
    }
    return addEquipmentsData;
  }

  static async deleteOccupantsEquipmentsData(id, occupant_id, companyId) {
    const deleteEquipmentsData = await database.occupants_equipments_data.findOne({
      where: { id },
    });
    if (!deleteEquipmentsData) {
      const err = ErrorCodes['160066'];
      throw err;
    }
    const deletedData = await database.occupants_equipments_data.destroy({
      where: { id },
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160065'];
      throw err;
    });

    const obj = {
      old: deleteEquipmentsData,
      new: {},
    };
    ActivityLogs.addActivityLog(Entities.occupants_equipments_data.entity_name, Entities.occupants_equipments_data.event_name.deleted,
      obj, Entities.notes.event_name.deleted, occupant_id, companyId, null, occupant_id, null);
    return deletedData;
  }
}

export default OccupantsEquipmentsDataService;
