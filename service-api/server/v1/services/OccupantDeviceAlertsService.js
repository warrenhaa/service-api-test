import { Op } from 'sequelize';
import database from '../../models';
import OccupantService from './OccupantService';
import ErrorCodes from '../../errors/ErrorCodes';
import Logger from '../../utils/Logger';

const lodash = require('lodash');

class OccupantDeviceAlertsSerivice {
  static getAlerts(sliderObj, sharedDeviceCodeList) {
    return new Promise(async (resolve, reject) => {
      const { type } = sliderObj;
      let devicesList = [];
      if (type == 'gateway') {
        var coordinator_device_id = sliderObj?.gateway?.coordinator_device?.dataValues?.id || null
        delete sliderObj.gateway.occupants_permissions;
        delete sliderObj.gateway.coordinator_device;
        var devices = await database.devices.findAll({
          where: {
            [Op.or]: [
              { id: sliderObj.id },
              { gateway_id: sliderObj.id },
            ],
            is_manually_added: true,
            id: {
              [Op.ne]: coordinator_device_id
            }
          },
        }).then((result) => {
          devicesList = lodash.map(result, 'id');
          return result;
        }).catch((error) => {
          Logger.error(error);
          const err = ErrorCodes['160018'];
          reject(err);
        });
      } else if (type == 'location') {
        var devices = await database.devices.findAll({
          where: {
            location_id: sliderObj.location.id,
            type: { [Op.or]: [{ [Op.in]: ['gateway', 'coordinator_device'] }, null] },
            device_code: { [Op.in]: sharedDeviceCodeList },
          },
        }).then((result) => {
          devicesList = lodash.map(result, 'id');
          return result;
        }).catch((error) => {
          Logger.error(error);
          const err = ErrorCodes['160018'];
          reject(err);
        });
      }

      const deviceAlerts = await database.devices.findAll({
        attributes: ['id', 'device_code', 'model', 'status', 'name'],
        include: [
          {
            required: true,
            attributes: ['id', 'alert_type', 'alert_code', 'is_viewed', 'severity', 'created_at'],
            model: database.device_alerts,
          },
        ],
        where: {
          id: {
            [Op.in]: devicesList,
          },
        },
      }).then((result) => result).catch((error) => {
        Logger.error(error);
        const err = ErrorCodes['160018'];
        throw err;
      });
      sliderObj.items = deviceAlerts;
      resolve(sliderObj);
    });
  }

  static async getOccupantAlerts(occupant_id, company_id) {
    const occupant = await database.occupants.findOne({
      where: { id: occupant_id },
    });
    if (!occupant) {
      const err = ErrorCodes['160010'];
      throw err;
    }
    let sharedDeviceCodeList = [];
    if (occupant.identity_id) {
      const { identity_id } = occupant;
      sharedDeviceCodeList = await OccupantService.sharedDeviceList(identity_id).catch((err) => { throw err; });
    }
    const sliderList = await OccupantService.getOccupantSliderList(occupant_id, company_id).catch((err) => { throw err; });
    const promiseList = [];
    for (const element of sliderList) {
      promiseList.push(await this.getAlerts(element, sharedDeviceCodeList));
    }
    const deviceAlerts = [];
    await Promise.all(promiseList).then((results) => {
      results.forEach((element) => {
        if (element.items.length > 0) {
          deviceAlerts.push(element);
        }
      });
    }).catch((error) => {
      Logger.error(error);
      const err = ErrorCodes['160018'];
      throw err;
    });
    let camera_devices = await database.sequelize.query(`SELECT camera_device_id FROM camera_devices JOIN occupants_camera_permissions ON 
            camera_devices.id = occupants_camera_permissions.camera_device_id JOIN occupants_permissions ON
            occupants_permissions.id = occupants_camera_permissions.occupant_permission_id
             where occupant_id = :occupant_id `,
                {
                    raw: true,
                    replacements: {
                        occupant_id: occupant_id,
                    },
                    logging: console.log,
      })
    let camera_device = lodash.map(camera_devices[0], 'camera_device_id')
    console.log("🚀 ~ file: OccupantDeviceAlertsService.js:121 ~ OccupantDeviceAlertsSerivice ~ getOccupantAlerts ~ camera_device", camera_device)
    const cameraDeviceAlert = await database.camera_devices.findAll({
      attributes: ['id', 'name', 'type', 'camera_id', 'gateway_id', 'occupant_id'],
      include: [
          {
            required: true,
            attributes: ['id', 'alert_type', 'alert_code', 'is_viewed', 'severity', 'camera_device_id',  'created_at'],
            model: database.device_alerts,
          },
        ],
      where: {
        id: {
          [Op.in]: camera_device,
        }
      },
      }).then((result) => result).catch((error) => {
        Logger.error(error);
        const err = ErrorCodes['160018'];
        throw err;
      }); 
    console.log("🚀 ~ file: OccupantDeviceAlertsService.js:141 ~ OccupantDeviceAlertsSerivice ~ getOccupantAlerts ~ cameraDeviceAlert", cameraDeviceAlert)
    if (cameraDeviceAlert && cameraDeviceAlert.length > 0) {
      let cameraresponse = [...cameraDeviceAlert]
      if (deviceAlerts && deviceAlerts.length > 0) {
        for (let ele of deviceAlerts) {
          cameraresponse.forEach(async (element, index) => {
            if (element.gateway_id === ele.id) {
              ele.items.push(element)
              delete cameraresponse[index]
            } 
          })
        }
      }
      let finalCameraResponse = []
      cameraDeviceAlert.forEach(async (element, index) => {
        if (cameraDeviceAlert[index] === cameraresponse[index]) {
          finalCameraResponse.push(element)
        }
       })

      const alerts = [...deviceAlerts,...finalCameraResponse];
      return (alerts);  
    }
   
    return (deviceAlerts);
  }

  static async getOccupantDeviceAlertsCount(req) {
    const { id } = req.query;
    const { company_id } = req;
    const occupant = await database.occupants.findOne({
      where: { id },
    });
    if (!occupant) {
      const err = ErrorCodes['160010'];
      throw err;
    }
    let sharedDeviceCodeList = [];
    if (occupant.identity_id) {
      const { identity_id } = occupant;
      sharedDeviceCodeList = await OccupantService.sharedDeviceList(identity_id).catch((err) => { throw err; });
    }
    const sliderList = await OccupantService.getOccupantSliderList(id, company_id).catch((err) => { throw err; });

    const gatewayIdList = [];
    const locationIdList = [];
    const coordinatorIdList = []
    sliderList.forEach((element) => {
      if (element.type == 'gateway') {
        gatewayIdList.push(element.id);
        if (element?.gateway?.coordinator_device?.id) {
          coordinatorIdList.push(element.gateway.coordinator_device.id)
        }
      } else if (element.type == 'location') {
        locationIdList.push(element.location.id);
      }
    });

    const deviceList = await database.devices.findAll({
      where: {
        [Op.or]: [{
          [Op.or]: [{
            id: { [Op.in]: gatewayIdList },
          },
          {
            gateway_id: { [Op.in]: gatewayIdList },
          }],
        }, {
          [Op.and]: [
            {
              location_id: {
                [Op.in]: locationIdList,
              },
            }, {
              device_code: { [Op.in]: sharedDeviceCodeList },
            }],
        }],
        is_manually_added: true,
        id: {
          [Op.notIn]: coordinatorIdList
        }
      },
    }).catch((error) => {
      Logger.error('error', error);
      const err = ErrorCodes['160018'];
      throw err;
    });

    const deviceIdList = lodash.map(deviceList, 'id');
    const deviceAlertsCount = await database.device_alerts.count(
      {
        where: { device_id: { [Op.in]: deviceIdList } },
      },
    ).catch((error) => {
      Logger.error('error', error);
      const err = ErrorCodes['160018'];
      throw err;
    });
    const count = {
      count: deviceAlertsCount,
    };
    return count;
  }
}
export default OccupantDeviceAlertsSerivice;
