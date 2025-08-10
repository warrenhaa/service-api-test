import { Op } from 'sequelize';
import CameraDeviceActionQueue from '../../sqs/CameraDeviceActionQueueProducer';
import database from '../../models';
import Responses from '../../utils/constants/Responses';
import ErrorCodes from '../../errors/ErrorCodes';

class CameraService {
  static async deleteCameraAction(cameraDeviceId, occupantId) {
    const checkCamera = await database.camera_devices.findOne({
      where: {
        camera_id: cameraDeviceId,
        occupant_id: occupantId,
      },
    }).catch((err) => {
      throw err;
    });
    if (!checkCamera) {
      const error = ErrorCodes['480000'];
      throw error;
    }
    const obj = {
      occupant_id: occupantId,
      camera_id: cameraDeviceId,
      acion: {
        type: 'camera',
        event: 'delete',
      },
      time: new Date().toUTCString(),
    };
    CameraDeviceActionQueue.sendProducer(obj);
    return (Responses.responses.camera_delete_job_message);
  }

  static async getHistory(camera_id, property_name,
    start_date, end_date, company_id, order) {
    const cameraData = await database.camera_devices.findOne({
      where: {
        camera_id,
      }
    }).catch((error) => {
      throw error;
    });
    if (!cameraData) {
      const err = ErrorCodes['460000'];
      throw err;
    }
    const where = {
      company_id,
      camera_id,
      created_at: {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      }
    }
    if (property_name) {
      where.property_name = property_name
    }
    let orderBy = [['updated_at', 'DESC']]
    if (order) {
      orderBy = [['updated_at', order]]
    }
    console.log("🚀 ~ CameraService ~ where:", where)
    const cameraEvents = await database.camera_events.findAll({
      where,
      order: orderBy
    }).catch((error) => {
      throw error;
    });
    if (cameraEvents.length > 0) {
      cameraEvents.map((data) => {
        if (data.property_value) {
          data.property_value = data.property_value.value
        }
      })
    }
    return cameraEvents;
  }
}
export default CameraService;
