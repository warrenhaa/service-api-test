import Util from '../../utils/Utils';
import CameraService from '../services/CameraService';
import ApplicationError from '../../errors/ApplicationError';
import ErrorCodes from '../../errors/ErrorCodes';

const util = new Util();

class CameraController {
  static async deleteCameraAction(req, res) {
    const cameraDeviceId = req.query.camera_id;
    const occupantId = req.occupant_id;
    const deleteCameraAction = await CameraService.deleteCameraAction(
      cameraDeviceId,
      occupantId,
    ).then((result) => result).catch((e) => {
      throw (e);
    });
    util.setSuccess(200, deleteCameraAction);
    return util.send(req, res);
  }


  static async getHistory(req, res) {
    let { camera_id, property_name, start_date,
      end_date, order } = req.query;
    const { company_id } = req.body;
    const cameraHistory = await CameraService.getHistory(camera_id, property_name,
      start_date, end_date, company_id, order)
      .catch((err) => {
        throw new ApplicationError(err);
      });
    if (cameraHistory) {
      util.setSuccess(200, cameraHistory);
    } else {
      const err = ErrorCodes['460003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }
}

export default CameraController;
