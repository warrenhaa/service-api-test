import lodash, { } from 'lodash';
import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import {
  getOneFromCache, setInCache
} from '../../cache/Cache';
import CacheKeys from '../../cache/Constants';
import userService from './UsersService';
import LocationsService from './LocationsService';
import AccessPermissionService from './AccessPermissionService';
import checkAllDeviceAccess from '../helpers/CheckAllDeviceAccess';
import Logger from '../../utils/Logger';
import { DPCommands } from '../../utils/constants/DeviceProvisionCommands';
import ROLES from '../../utils/constants/Roles';
import locationLevels from '../../utils/constants/LocationTypes';
import jobsService from './JobsService';
import UsersService from './UsersService';
import OccupantService from './OccupantService';
import ErrorCodes from '../../errors/ErrorCodes';
import OccupantsPermissionsService from './OccupantsPermissionsService'
import OccupantsGroupsService from './OccupantsGroupsService'
import coordinatorDeviceModels from '../../utils/constants/CoordinatorDeviceModels';
import OccupantsDashboardAttributesService from './OccupantsDashboardAttributesService'
import DeviceProvisionService from './DeviceProvisionService';
import communicateWithAwsIotService from './CommunicateWithAwsIotService';
import UserService from './UsersService';
import OneTouchRulesService from './OneTouchRulesService';
import SchedulesService from '../services/SchedulesService';
import SingleControlsService from './SingleControlService';
import cameraDeviceActionQueue from '../../sqs/CameraDeviceActionQueueProducer';
import { getCompany } from '../../cache/Companies';
import safe4camera from '../../sqs/safe4CameraSqs-devProducer';
const categoryb_database = require('../../categoryb_models');
const { v4: uuidV4 } = require('uuid');
const { executeQuery } = require('../../redshift/config')
const AWS = require('aws-sdk');
const fs = require('fs');
const uuid = require('uuid');
const { Op, QueryTypes } = database.Sequelize;
const SITE_CHILD_LOCS = locationLevels.slice(1);
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const axios = require('axios');
class DevicesService {

  static async sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  static convertToTimezone(utcTime, timezone) {
    return momentTimezone.utc(utcTime).tz(timezone).format('YYYY-MM-DD HH:mm:ss.SSS');
  }

  static async getThingShadow(gateway_code, company_id) {
    var params = {
      thingName: gateway_code, /* required */
    };
    const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
    if (!shadowData) {
      // gateway shadow not updated
      const err = ErrorCodes['330005'];
      throw err;
    }
    var payload = JSON.parse(shadowData.payload);
    let base_key = null;
    let connected = null
    const { reported } = payload.state;
    if (reported && reported.cloud_metadata_factoryreset_history == 'Unregister') {
      await this.sleep(500)
      var result = await this.getThingShadow(gateway_code, company_id).catch(err => {
        throw err;
      })
      return result
    } else {
      let base = null;
      Object.keys(reported).forEach((key) => {
        if (reported[key].hasOwnProperty('properties')) {
          const { properties } = reported[key];
          base_key = key;
          if (Object.keys(properties).length > 0) {
            base = Object.keys(properties)[0];
          }
        }
      });
      if (reported && reported.connected) {
        connected = reported.connected
      }
      if (base_key) {
        reported[base_key].connected = connected
        return reported[base_key];
      } else {
        return null
      }
    }
  }

  static async getGatewayThings(params, company_id, count) {
    const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'listThingsInThingGroup')
      .then((data) => data).catch(err => { throw err; });
    if (shadowData) {
      if (shadowData.things.length > 0) {
        return shadowData;
      } else {
        if (count <= 15) {
          await this.sleep(1000)
          count = count + 1
          var data = await this.getGatewayThings(params, company_id, count).catch(err => { throw err; });
          return data;
        } else {
          return null
        }
      }
    } else {
      return null
    }
  }

  static async addDeviceReference(device_id) {
    let data = null
    data = await SchedulesService.getDeviceSchedulesByDeviceId(device_id).catch((err) => {
      throw err;
    });
    const deviceReferenceObj = await database.device_references.create({
      device_id, data
    }).then((result) => result)
      .catch((error) => {
        const err = ErrorCodes['330005'];
        throw err;
      });
    return deviceReferenceObj;
  }

  static async getKeyValue(obj) {
    const attr = Object.keys(obj).map((key) => {
      const property = {};
      property.Name = key;
      property.Value = obj[key];
      return property;
    });
    return attr;
  }

  static async getCoordinatorDeviceFromThingGroup(device_code, company_id, count) {
    var coordinator_device_model = null;
    var coordinator_device_code = null
    var deviceCodeSplitArray = device_code.split('-')
    if (count > 3) {
      return {
        coordinator_device_model,
        coordinator_device_code
      }
    }
    if (deviceCodeSplitArray.length > 1) {
      var thingGroupName = 'Gateway-' + deviceCodeSplitArray[1]
      var params = {
        thingGroupName
      };
      const shadowData = await this.getGatewayThings(params, company_id, 0)
        .then((data) => data).catch(err => { throw err; });
      if (shadowData && shadowData.things) {
        for (const item of shadowData.things) {
          var itemSplitArray = item.split('-')
          if (itemSplitArray.length > 2) {
            var deviceModel = itemSplitArray[2]
            if (deviceModel.toUpperCase().endsWith('ZC')) {
              coordinator_device_model = deviceModel
              coordinator_device_code = item
            }
          }
        }
      }
      if (coordinator_device_code && coordinator_device_model) {
        return {
          coordinator_device_model, coordinator_device_code
        }
      } else {
        count = count + 1
        await DeviceProvisionService.sleep(1000)
        var result = await this.getCoordinatorDeviceFromThingGroup(device_code, company_id, count)
        return result;
      }

    } else {
      return {
        coordinator_device_model, coordinator_device_code
      }
    }
  }
  static async addRuleGroups(name, icon, rules, gateway_id, company_id, user_id) {
    // check valid gateway_id
    const nameExist = await database.rule_groups.findOne({
      where: { name, gateway_id },
      raw: true,
    }).catch((err) => {
      throw err;
    });
    if (!nameExist) {
      const addRuleGroups = await database.rule_groups.create({
        name, icon, rules, gateway_id, company_id, key: uuidV4(),
      }).then((result) => result).catch((error) => {
        const err = ErrorCodes['370003'];
        throw err;
      });
      const Obj = {
        old: {},
        new: addRuleGroups,
      };
      if (addRuleGroups) {
        ActivityLogs.addActivityLog(Entities.rule_groups.entity_name, Entities.rule_groups.event_name.added,
          Obj, Entities.notes.event_name.added, addRuleGroups.id, company_id, user_id, null, null);
      }
      return addRuleGroups;
    }
  }

  static async publishSyncBlockProperty(company_id, gateway_code, value) {
    var params = {
      thingName: gateway_code,
    };
    const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
    if (!shadowData) {
      // gateway shadow not updated
      const err = ErrorCodes['330005'];
      throw err;
    }
    const property = `premium_app:sync_block`;
    var payload = {
      state:
      {
        reported: {},
      },
    };
    payload.state.reported[property] = JSON.stringify(value);
    const topic = `$aws/things/${gateway_code}/shadow/update`;
    var params = {
      topic,
      payload: JSON.stringify(payload),
    };
    const publishShadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'publish').then((data) => data);
    if (!publishShadowData) {
      const err = ErrorCodes['330005']; // not published the url
      throw err;
    }
    return { success: true };
  }

  static async createDevice(req) {
    let { coordinator_device_code, coordinator_device_model, name, device_code, gateway_id, type, model, location_id, company_id,
      metadata, grid_order, bluetooth_id, mdns_id,
      publish_on_gateway, publish_on_coordinator, publish_on_device } = req.body;
    let publishGateway = [];
    let publishCoordinator = [];
    let publishDevice = [];
    let device = null;
    let gateway = null;
    let obj = {}
    let location = null
    let locationId = null
    let ruleObject = [
      {
        name: 'Home',
        icon: 'house',
        rule: []
      },
      {
        name: 'Away',
        icon: 'away',
        rule: []
      }
    ]
    if (type && type != 'gateway') {
      type = null
    }
    const accessToken = req.headers['x-access-token'];
    let isTest = 'false';
    if (req.headers['is_test']) {
      isTest = req.headers['is_test'];
    }

    if (location_id) {
      locationId = location_id
    }
    // if occupant then take his default location
    if (req.occupant_id) {
      var occupantLocationObj = await database.occupants_locations.findOne({ include: [{ required: true, model: database.locations, as: 'location' }], where: { occupant_id: req.occupant_id, status: "default" } })
        .catch((err) => {
          throw err
        });
      if (occupantLocationObj) {
        if (occupantLocationObj.location_id) {
          locationId = occupantLocationObj.location_id
        }
      } else {
        //create default location for occupant
        // let occupantLocation = OccupantService.addOccupantDefaultLocation(company_id, req.occupantDetails.email, req.occupant_id)
        //   .catch((err) => {
        //     throw err
        //   });
        // if (occupantLocation && occupantLocation.location_id) {
        //   locationId = occupantLocation.location_id
        // }
      }
    } else {
      //if not occupant then check  location_id exists only for gateway
      if (locationId) {
        let locationExists = await database.locations.findOne({ where: { id: locationId } }).catch((err) => {
          console.log(err);
        });
        if (!locationExists) {
          const err = ErrorCodes['150003'];
          throw err;
        }
      }
    }
    //here we check device exists or not
    //if exists then we check location_id is attached to it or not
    //if attached means someone added this device already
    //as every added device will have location
    if (type == 'gateway' && accessToken && req.occupant_id && (mdns_id || bluetooth_id)) {
      const headerParams = {
        Authorization: accessToken,
      };
      let tryCount = 0;
      const company = await getCompany(company_id).then(result => {
        return (result);
      }).catch((error) => {
        console.log(err);
        throw (error);
      });
      if (!company) {
        const err = ErrorCodes['000001'];
        throw (err);
      }

      if (company.configs && company.configs.device_provision_trycount) {
        tryCount = company.configs.device_provision_trycount; //purmo
      }

      if (company.configs && company.configs.max_gateway) {

        var gatewayCount = await database.occupants_permissions.count({
          include: [{
            model: database.devices,
            required: true,
            as: 'gateway'
          }],
          where: {
            '$gateway.type$': 'gateway',
            receiver_occupant_id: req.occupant_id
          },
          //logging: console.log
        }).catch((err) => {
          console.log(err);
        })

        if (gatewayCount >= company.configs.max_gateway) {
          const err = ErrorCodes['800038'];
          throw err;
        }
      }

      let deviceFormObj = {
        UserID: req.occupantDetails.identity_id,
        Username: req.occupantDetails.email,
        Command: DPCommands.registerOwner,
      };
      let gatewayMacAddress = null;
      if (mdns_id) {
        deviceFormObj["mDNSID"] = mdns_id
        const mdnsId = mdns_id.split('-')
        gatewayMacAddress = mdnsId[1]
      }
      else {
        deviceFormObj["BluetoothID"] = bluetooth_id
        const blueToothId = bluetooth_id.split('-')
        gatewayMacAddress = blueToothId[1]
        if (gatewayMacAddress.length > 12) {
          gatewayMacAddress = gatewayMacAddress.substr(gatewayMacAddress.length - 12)
        }
      }
      if (gatewayMacAddress) {
        var findGateway = await database.devices.findOne({
          where: {
            device_code: {
              [Op.iLike]: `%${gatewayMacAddress}%`,
            },
            type,
          }
        })

        if (findGateway) {
          var findPermissionForGateway = await database.occupants_permissions.findOne({
            where: {
              gateway_id: findGateway.id,
              receiver_occupant_id: req.occupant_id,
            }
          })
          if (findPermissionForGateway) {

            // new code added to publish commands for Gateway.
            if (type == 'gateway' && publish_on_gateway && Object.keys(publish_on_gateway).length > 0) {
              const KeyValue = await this.getKeyValue(publish_on_gateway);
              publishGateway = KeyValue;
              //publish message
              await this.publishDeviceNameArray(company_id, findGateway.device_code, publishGateway)
                .catch(err => {
                  throw err;
                });


              let coordinator_device = await database.devices
                .findOne({ where: { gateway_id: findGateway.id, type: 'coordinator_device' } })
                .catch((error) => {
                  const err = ErrorCodes['800002'];
                  throw err
                });
              if (coordinator_device) {
                if (type == 'gateway' && publish_on_coordinator && Object.keys(publish_on_coordinator).length > 0) {
                  const KeyValue = await this.getKeyValue(publish_on_coordinator);
                  publishCoordinator = KeyValue;
                  //publish message
                  await this.publishDeviceNameArray(company_id, coordinator_device.device_code, publishCoordinator)
                    .catch(err => {
                      throw err;
                    });
                }
              }
            }

            // for (let key in ruleObject) {
            //       var element = ruleObject[key]
            //       await this.addRuleGroups(element.name, element.icon, element.rule, device.id, company_id, req.user_id)
            //         .catch(err => {
            //           throw err;
            //         });
            //     }
            var sliderDetails = await OccupantService.getSliderGatewayDetails(findGateway.id, req.occupant_id, company_id).catch((err) => { Logger.error("error", err) });
            return sliderDetails
          }
        }
        var checkGatewayExistResult = await this.checkGatewayExist(bluetooth_id, mdns_id, req.occupant_id)
        if (findGateway && checkGatewayExistResult && checkGatewayExistResult.registered == true) {
          const devices = await database.devices.findAll({
            where: { gateway_id: findGateway.id },
          });
          var promiseList = []
          var itemIds = []
          itemIds.push(findGateway.id)
          var emptyDeviceName = "{\"deviceName\":\"\",\"ShortID_d\":0}";
          var emptyAppDataC = "{\"addr\":{\"city\":\"\",\"country\":\"\",\"state\":\"\",\"\":\"\",\"zip\":\"\"},\"photourl\":\"\",\"sensorName\":{\"sensor1\":null}}";
          var propertyDeviceName = ":sZDO:SetDeviceName";
          var propertyAppDataC = ":sZDOInfo:SetAppData_c";
          for (const device of devices) {
            itemIds.push(device.id)
            promiseList.push(await this.publishDeviceName(company_id, device.device_code, propertyDeviceName, emptyDeviceName))
            if (device.type == 'coordinator_device') {
              promiseList.push(await this.publishDeviceName(company_id, device.device_code, propertyAppDataC, emptyAppDataC))
            }
          }
          await Promise.all(promiseList).then((results) => {
            return results
          }).catch(error => {
            const err = ErrorCodes['800022'];
            throw err;
          });
          //delete dashboard attributes of the devices,gateway
          await this.deleteDashboardAttributes(itemIds, company_id).catch(err => {
            throw err;
          });
          //delete the groups connected on the gateway
          await this.deleteGatewayOccupantGroups(findGateway.id, req.occupant_id, company_id, req.source_IP)
            .catch(err => {
              throw err;
            })
          //Just call device provision api  and remove record from occupants permissions table for all gateway users
          await this.deleteOccupantPermissions(findGateway.id, req.occupant_id, company_id, req.occupantDetails.email, req.source_IP)
            .catch(err => {
              throw err;
            })

          for (const elements of itemIds) {
            const updateDevice = await database.devices.update(
              { is_manually_added: false }, {
              where: { id: elements },
              returning: true,
              plain: true,
            })

          }
        }
      }
      await DeviceProvisionService.deviceProvison(headerParams, deviceFormObj, tryCount)
        .then(async (result) => {
          var data = result.data
          if (data.errorMessage) {
            const err = ErrorCodes['380001'];
            throw err;
          } else {
            if (data.statusCode != 200) {
              const err = ErrorCodes['380001'];
              err.message = data.body
              throw err;
            } else {

              var successMessage = data.body
              device_code = successMessage.replace("\"Success ", "").replace("\"", "")
              //get shadow and update the model
              // var gatewayShadow = await this.getThingShadow(device_code, company_id).catch(err => { console.log(err); throw err; })
              // if (gatewayShadow) {
              //   model = gatewayShadow.model
              // }
              if (device_code) {
                var deviceCodeSplitArray = device_code.split('-')
                if (deviceCodeSplitArray.length > 1) {
                  model = deviceCodeSplitArray[0]
                }
              }
              return device_code
            }
          }
        })
        .catch((error) => {
          const err = ErrorCodes['380001'];
          throw err;
        });
    }
    if (device_code) {
      if (type == 'gateway') {
        var coordinatorResult = await this.getCoordinatorDeviceFromThingGroup(device_code, company_id, 0)
        if (coordinatorResult.coordinator_device_model && coordinatorResult.coordinator_device_code) {
          coordinator_device_model = coordinatorResult.coordinator_device_model
          coordinator_device_code = coordinatorResult.coordinator_device_code
        }
      }
      let deviceExists = await database.devices.findOne({ where: { device_code } }).catch((error) => {
        const err = ErrorCodes['800018'];
        throw err
      });
      if (deviceExists) {
        if (!req.occupant_id && deviceExists.location_id != null) {
          const err = ErrorCodes['800018'];
          throw err;
        }
        if (req.occupant_id && type == 'gateway') {
          let occupantPermissionExists = await database.occupants_permissions.findOne({ where: { gateway_id: deviceExists.id } })
            .catch((err) => {
              throw err
            });
          if (occupantPermissionExists) {
            const err = ErrorCodes['800018'];
            throw err;
          }
        }
        if (req.occupant_id && (!type || type == 'device') && deviceExists.is_manually_added === true) {
          const err = ErrorCodes['800018'];
          throw err;
        }
      }
      // add device
      if (type !== 'gateway') {
        gateway = await database.devices.findOne({ where: { id: gateway_id } }).catch((error) => {
          const err = ErrorCodes['800013'];
          throw err
        });
        if (!gateway) {
          const err = ErrorCodes['800013'];
          throw err;
        }
        //checking whether the device code has any gatewaythings or not
        let deviceCodeSplitArray = device_code.split('-')
        let thingGroupName = 'Gateway-' + deviceCodeSplitArray[1]
        const params = {
          thingGroupName
        };
        const getGatewayThings = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'listThingsInThingGroup')
          .then((data) => {
            return data;
          }).catch((err) => {
            throw err;
          });

        if (!getGatewayThings) {
          const err = ErrorCodes['470000'];
          throw err;
        }
        if (isTest != 'true' && (getGatewayThings && (!getGatewayThings.things || getGatewayThings.things.length == 0))) {
          const err = ErrorCodes['470000'];
          throw err;
        } else {
          if (isTest == 'true' || (getGatewayThings && getGatewayThings.things.length > 0 && getGatewayThings.things.includes(device_code))) {
            obj["name"] = name
            obj["device_code"] = device_code
            obj["gateway_id"] = gateway.id
            obj["model"] = model
            obj["location_id"] = locationId || gateway.location_id || null
            obj["company_id"] = company_id
            obj["is_manually_added"] = true;
            obj["registered_at"] = new Date()
          } else {
            const err = ErrorCodes['470000'];
            throw err;
          }
        }
      } else {
        obj["name"] = name
        obj["device_code"] = device_code
        obj["type"] = type
        obj["model"] = model || null
        obj["location_id"] = locationId || null
        obj["company_id"] = company_id
        obj["is_manually_added"] = true;
        obj["registered_at"] = new Date()
      }
      //get company object
      var company = await getCompany(company_id).then(result => {
        return (result);
      }).catch((error) => {
        console.log(err);
        throw (error);
      });
      if (!company) {
        const err = ErrorCodes['000001'];
        throw (err);
      }
      if (!deviceExists) {
        // add  condition to check type is not coordnator_device and model not ends with ZC
        if (!model) {
          let deviceCodeSplit = device_code.split('-');
          model = (deviceCodeSplit.length == 2) ? deviceCodeSplit[0] : deviceCodeSplit[2];
        }
        if (model && model.toUpperCase().endsWith('_ZC') || type == 'coordinator_device') {
          console.log("error caught:");
          const err = ErrorCodes['490004']; // coordintor_device cannot be added
          throw err
        }
        device = await database.devices.create(obj).catch((error) => {
          const err = ErrorCodes['800014'];
          throw err
        });
        const activityLogObj = {
          old: {},
          new: device,
        };
        if (req.occupant_id && type == "gateway") {
          var body = { gateway_id: device.id, company_id, receiver_occupant_id: req.occupant_id, invitation_email: req.occupantDetails.email, sharer_occupant_id: req.occupant_id, access_level: "O", is_temp_access: false, device_code: device_code, request_id: req.request_id }
          OccupantsPermissionsService.addOccupantsPermission(body).catch((err) => {
            console.log(err);
            throw err
          });
        }

        if (!req.occupant_id) {
          if (type == "gateway") {
            ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.gateway_added,
              activityLogObj, Entities.notes.event_name.added, device.id, company_id, req.user_id, null, null, req.source_IP);
          } else {
            ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.added,
              activityLogObj, Entities.notes.event_name.added, device.id, company_id, req.user_id, null, null, req.source_IP);

            const formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

            let deviceListChanged = {
              "deviceListChanged": {
                "event": true,
                "eventTime": formattedDateTime,
              }
            }
            await this.publishSyncBlockProperty(company_id, gateway.device_code, deviceListChanged)

          }
        } else {
          if (grid_order) {
            let input = {
              item_id: device.id,
              type: 'device',
              grid_order,
            };
            if (type == "gateway") {
              input = {
                item_id: device.id,
                type: 'gateway',
                grid_order,
              };
            }
            //add grid order to all shared occupants ,only for purmo
            let gridOrderEnabled = false;
            if (company.configs && company.configs.shared_devices_default_grid_order_enabled) {
              gridOrderEnabled = company.configs.shared_devices_default_grid_order_enabled;
            }
            if (type != "gateway" && gridOrderEnabled == true) {
              //get all gateway occupant ids
              var occupants_permissions = await database.occupants_permissions.findAll({ where: { gateway_id: gateway.id } })
                .catch((error) => {
                  const err = ErrorCodes['800013'];
                  throw err
                });

              // add permissions to all shared occupants
              if (occupants_permissions && occupants_permissions.length > 0) {
                for (const element of occupants_permissions) {
                  if (element.receiver_occupant_id) {
                    await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(input, company_id, element.receiver_occupant_id, req.source_IP)
                      .catch((err) => {
                        console.log(err);
                        throw err
                      });
                  }
                }
              }
            }
            await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(input, company_id, req.occupant_id, req.source_IP).catch((err) => {
              console.log(err);
              throw err
            });
          }
          if (type == "gateway") {
            ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.gateway_added,
              activityLogObj, Entities.notes.event_name.added, device.id, company_id, null, req.occupant_id, null, req.source_IP);
          } else {
            ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.added,
              activityLogObj, Entities.notes.event_name.added, device.id, company_id, null, req.occupant_id, null, req.source_IP);

            const formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

            let deviceListChanged = {
              "deviceListChanged": {
                "event": true,
                "eventTime": formattedDateTime,
              }
            }
            await this.publishSyncBlockProperty(company_id, gateway.device_code, deviceListChanged)

          }
        }
      } else {
        device = await database.devices.update(obj, {
          where: {
            id: deviceExists.id
          }, returning: true
        }).then((result) => {
          return result[1][0].dataValues
        }).catch((err) => {
          console.log(err);
          throw err
        });
        if (req.occupant_id && type == "gateway") {
          var body = {
            gateway_id: deviceExists.id, company_id, invitation_email: req.occupantDetails.email, receiver_occupant_id: req.occupant_id, sharer_occupant_id: req.occupant_id, access_level: "O", is_temp_access: false, device_code: device_code, request_id: req.request_id
          }
          await OccupantsPermissionsService.addOccupantsPermission(body).catch((err) => {
            console.log(err);
            throw err
          });
        }
        if (type != 'gateway') {
          const formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

          let deviceListChanged = {
            "deviceListChanged": {
              "event": true,
              "eventTime": formattedDateTime,
            }
          }
          await this.publishSyncBlockProperty(company_id, gateway.device_code, deviceListChanged)

        }
        if (req.occupant_id && grid_order) {
          let input = {
            item_id: device.id,
            type: 'device',
            grid_order,
          };
          if (type == "gateway") {
            input = {
              item_id: device.id,
              type: 'gateway',
              grid_order,
            };
          }
          //add grid order to all shared occupants ,only for purmo
          let gridOrderEnabled = false;
          if (company.configs && company.configs.shared_devices_default_grid_order_enabled) {
            gridOrderEnabled = company.configs.shared_devices_default_grid_order_enabled;
          }
          if (type != "gateway" && gridOrderEnabled == true) {
            //get all gateway occupant ids
            var occupants_permissions = await database.occupants_permissions.findAll({ where: { gateway_id: gateway.id } })
              .catch((error) => {
                const err = ErrorCodes['800013'];
                throw err
              });

            // add permissions to all shared occupants
            if (occupants_permissions && occupants_permissions.length > 0) {
              for (const element of occupants_permissions) {
                if (element.receiver_occupant_id) {
                  await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(input, company_id, element.receiver_occupant_id, req.source_IP)
                    .catch((err) => {
                      console.log(err);
                      throw err
                    });
                }
              }
            }
          }
          await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(input, company_id, req.occupant_id, req.source_IP).catch((err) => {
            console.log(err);
            throw err
          });
        }
      }
      // new code added to publish commands for Gateway.
      if (type == 'gateway' && publish_on_gateway && Object.keys(publish_on_gateway).length > 0) {
        const KeyValue = await this.getKeyValue(publish_on_gateway);
        publishGateway = KeyValue;
        //publish message
        await this.publishDeviceNameArray(company_id, device.device_code, publishGateway)
          .catch(err => {
            throw err;
          });
      }

      // new code added to publish commands for device.
      if (type !== 'gateway' && type !== 'coordinator_device' && publish_on_device && Object.keys(publish_on_device).length > 0) {
        const KeyValue = await this.getKeyValue(publish_on_device);
        publishDevice = KeyValue;
        //publish message
        await this.publishDeviceNameArray(company_id, device.device_code, publishDevice)
          .catch(err => {
            throw err;
          });
      }

      if (metadata) {
        var keys = Object.keys(metadata)
        var device_id = device.id

        for (const key of keys) {
          var value = metadata[key]
          var deviceMetadataObj = await database.devices_metadata.findOne({
            where: {
              key,
              device_id
            }
          }).catch((err) => {
            console.log(err);
            throw err
          })
          if (!deviceMetadataObj) {
            await database.devices_metadata.create({
              key, value, device_id
            }).catch((err) => {
              console.log(err);
              throw err
            });
          } else {
            await database.devices_metadata.update(value, {
              where: { key, device_id }
            }).catch((err) => {
              console.log(err);
              throw err
            });
          }
        }
      }

      if (coordinator_device_code && type == 'gateway') {
        let coordinator_device = await database.devices
          .findOne({ where: { device_code: coordinator_device_code } })
          .catch((error) => {
            console.log(error);
            const err = ErrorCodes['800014'];
            throw err
          });
        if (!coordinator_device) {
          await database.devices.create({
            company_id,
            type: 'coordinator_device',
            device_code: coordinator_device_code,
            gateway_id: device.id,
            location_id: locationId || device.location_id || null,
            model: coordinator_device_model,
            is_manually_added: true
          }).catch((error) => {
            console.log(error);
            const err = ErrorCodes['800014'];
            throw err
          });
        } else {
          var updateObj = {
            company_id,
            type: 'coordinator_device',
            device_code: coordinator_device_code,
            gateway_id: device.id,
            model: coordinator_device_model,
            is_manually_added: true
          }
          if (locationId || device.location_id) {
            updateObj["location_id"] = locationId || device.location_id
          }
          await database.devices.update(updateObj, {
            where: {
              id: coordinator_device.id
            },
            returning: true
          }).then((result) => {
            return result[1][0].dataValues
          }).catch((error) => {
            console.log(error);
            const err = ErrorCodes['800014'];
            throw err
          });
        }

        // new code added to publish commands for Coordinator device.
        if (type == 'gateway' && publish_on_coordinator && Object.keys(publish_on_coordinator).length > 0) {
          const KeyValue = await this.getKeyValue(publish_on_coordinator);
          publishCoordinator = KeyValue;
          //publish message
          await this.publishDeviceNameArray(company_id, coordinator_device_code, publishCoordinator)
            .catch(err => {
              throw err;
            });
        }
      }
      if (req.occupant_id) {
        if (type == "gateway") {
          const devicesList = await database.devices.findAll(
            {
              where: {
                gateway_id: device.id
              }
            });
          if (devicesList && devicesList.length > 0) {
            for (const element of devicesList) {
              const input = {
                item_id: element.id,
                type: 'device',
                grid_order: await OccupantsGroupsService.getRandomGridOrder(),
              };
              await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(input,
                company_id, req.occupant_id, req.source_IP);
            }
          }
          // for (let key in ruleObject) {
          //     var element = ruleObject[key]
          //     await this.addRuleGroups(element.name, element.icon, element.rule, device.id, company_id, req.user_id)
          //       .catch(err => {
          //         throw err;
          //       });
          //   }
          var sliderDetails = await OccupantService.getSliderGatewayDetails(device.id, req.occupant_id, company_id).catch((err) => { Logger.error("error", err) });
          return sliderDetails
        } else {
          var sliderDetails = await OccupantService.getSliderGatewayDetails(device.gateway_id, req.occupant_id, company_id).catch((err) => { Logger.error("error", err) });
          return sliderDetails
        }
      } else {
        return device;
      }
    } else {
      const err = ErrorCodes['800014'];
      throw err;
    }
  }

  static async changeOwner(req) {
    let { gateway_id, email } = req.body;

    let occupantId = req.occupant_id
    const accessToken = req.headers['x-access-token'];
    // if occupant then take his default location
    const gatewayExists = await database.devices.findOne({
      where: { id: gateway_id },
    }).catch(() => {
      const err = ErrorCodes['800013'];
      throw err;
    });
    if (!gatewayExists) {
      const err = ErrorCodes['800013'];
      throw err;
    };
    if (req.occupant_id && gatewayExists) {
      let occupantPermissionExists = await database.occupants_permissions.findOne({ where: { receiver_occupant_id: req.occupant_id, sharer_occupant_id: req.occupant_id,gateway_id } })
        .catch((err) => {
          throw err
        });
      if (!occupantPermissionExists) {
        const err = ErrorCodes['160045'];
        throw err;
      } else {
        let receiverOccupant = await database.occupants.findOne({ where: { email } })
          .catch((err) => {
            throw err
          });
        if (!receiverOccupant) {
          const err = ErrorCodes['160010'];
          throw err;
        } else {
          let oldOwner = await database.occupants.findOne({ where: { id: req.occupant_id } })
            .catch((err) => {
              throw err
            });
          let receiverPermission = await database.occupants_permissions.findOne({ where: { receiver_occupant_id: receiverOccupant.id ,gateway_id} })
            .catch((err) => {
              throw err
            });

          if (!receiverPermission) {
            const err = ErrorCodes['160026'];
            throw err;
          } else {

            if (receiverPermission && receiverPermission.access_level != 'O') {
              const err = ErrorCodes['700005'];
              throw err;
            } else {
              const headerParams = {
                Authorization: accessToken,
              };
              let tryCount = 0;
              let formObj = {
                UserID: req.occupantDetails.identity_id,
                Username: email,
                Command: DPCommands.swapOwner,
                DeviceID: gatewayExists.device_code
              };
              await DeviceProvisionService.deviceProvison(headerParams, formObj, tryCount)
                .then(async (result) => {
                  var data = result.data
                  if (data.errorMessage) {
                    const err = ErrorCodes['380001'];
                    throw err;
                  } else {
                    if (data.statusCode != 200) {
                      const err = ErrorCodes['380001'];
                      err.message = data.body
                      throw err;
                    } else {
                      return result
                    }
                  }
                })
                .catch((error) => {
                  const err = ErrorCodes['380001'];
                  throw err;
                });
              //swapping the main owner in permissions table
              await database.occupants_permissions.update({
                sharer_occupant_id: receiverOccupant.id,
              }, {
                where: {
                  id :{
                    [Op.in]:[
                      receiverPermission.id,
                      occupantPermissionExists.id
                    ]
                  },
                  gateway_id
                }
              }).catch(error => {
                const err = ErrorCodes['700006'];
                throw err;
              })
              //making recevier as owner
              // await database.occupants_permissions.update({
              //   sharer_occupant_id: receiverOccupant.id,
              // }, {
              //   where: {
              //     id: occupantPermissionExists.id
              //   }
              // }).catch(error => {
              //   const err = ErrorCodes['700006'];
              //   throw err;
              // })
              ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.change_owner,
                {
                  gateway: gatewayExists, oldOwner: oldOwner, newOwner: receiverOccupant
                }, Entities.notes.event_name.updated, receiverPermission.id, gatewayExists.company_id, null, occupantId, null, req.source_IP);
              return {
                "message": "Owner Swapped Successfully"
              }

            }
          }
        }
      }
    }
  }

  static async createBulkDevices(req) {
    const { devices } = req.body;
    let errorDevices = [];
    let resultArray = [];
    let gateway_id = null;
    const company_id = req.body.company_id;
    const occupant_id = req.occupant_id;
    let sliderDetails = {};

    for (let index = 0; index < devices.length; index += 1) {
      const device = devices[index];
      gateway_id = device.gateway_id;
      // check gateway record exists or not
      if (gateway_id) {
        const gatewayExists = await database.devices.findOne({
          where: { id: gateway_id },
        }).catch(() => {
          const err = ErrorCodes['800013'];
          throw err;
        });
        if (!gatewayExists) {
          const err = ErrorCodes['800013'];
          throw err;
        };
      }

      let obj = {
        body: device,
        user_id: req.user_id,
        occupant_id: occupant_id,
      };
      obj.body.company_id = company_id;
      obj.headers = req.headers;
      obj.occupantDetails = req.occupantDetails;
      // type gateway check
      if (device.type == 'gateway') {
        const error = {
          message: 'device type is gateway'
        }
        const errorData = {
          device: device,
          error: error
        }
        errorDevices.push(errorData);
      }
      if (device.type != 'gateway') {
        const deviceresult = await this.createDevice(obj)
          .catch((error) => {
            const errorData = {
              device: device,
              error: error
            }
            errorDevices.push(errorData);
          });
        if (deviceresult) {
          resultArray.push(device);
        }
      } // end of type check
    }
    if (gateway_id) {
      sliderDetails = await OccupantService.getSliderGatewayDetails(gateway_id, occupant_id, company_id).catch((err) => { Logger.error("error", err) });
    }

    return { successDevices: resultArray, errorDevices, slider_details: sliderDetails };
  }

  static async getUserDevices(req, userLocation) {
    const query = { ...req.query };
    query.location_id = userLocation;
    if (req.query.gateway_id) {
      query.gateway_id = req.query.gateway_id;
    }
    query.company_id = req.body.company_id;
    if (query.sortKeys) {
      delete query.sortKeys;
    }
    if (query.sortOrder) {
      delete query.sortOrder;
    }
    const devices = await database.devices.findAll({
      where: query,
      include: [
        {
          model: database.locations,
          required: false,
          as: 'locations',
        },
        {
          model: database.devices,
          required: false,
          as: 'gateway',
          include: [{
            model: database.locations,
            required: false,
            as: 'locations',
          }],
        },
      ],
      raw: true,
      nest: true,
    });
    return devices;
  }

  static async getAllDevices(req) {
    const id = req.body.company_id;
    const query = { ...req.query };
    query.company_id = id;
    if (req.query.gateway_id) {
      query.gateway_id = req.query.gateway_id;
    }
    if (query.sortKeys) {
      delete query.sortKeys;
    }
    if (query.sortOrder) {
      delete query.sortOrder;
    }
    const devices = await database.devices.findAll({
      where: query,
      include: [
        {
          model: database.locations,
          required: false,
          as: 'locations',
        },
        {
          model: database.devices,
          required: false,
          as: 'gateway',
          include: [{
            model: database.locations,
            required: false,
            as: 'locations',
          }],
        },
      ],
      raw: true,
      nest: true,
    });
    if (devices.gateway_id) {
      const gatewayDetails = await database.devices.findone({
        where: { id: devices.gateway_id },
      });
      devices.gateway = gatewayDetails;
    }
    return devices;
  }

  static async getAllDeviceTypes(req) {
    const companyId = req.body.company_id;
    const devices = await database.devices.findAll({
      attributes: ['type'],
      group: ['type'],
      where: {
        company_id: companyId,
      },
      raw: true,
    }).then((device) => {
      if (device.length <= 0) return null;
      let data = device.map((deviceType) => deviceType.type);
      data = data.filter((e) => e);
      return data;
    });
    return devices;
  }

  static async getDevice(req) {
    const { id } = req.params;
    const device = await database.devices.findOne({
      where: { id },
      raw: true,
      nest: true,
    }).then(async (result) => {
      if (!result) return null;
      const data = { ...result };
      if (result.location_id) {
        data.locations = await database.locations.findOne({
          where: {
            id: result.location_id,
          },
          raw: true,
        });
      }
      return data;
    });
    if (device && device.gateway_id) {
      const gatewayDetails = await database.devices.findOne({
        where: { id: device.gateway_id },
        include: [
          {
            model: database.locations,
            required: false,
            as: 'locations',
          },
        ],
        raw: true,
        nest: true,
      });
      device.gateway = gatewayDetails;
    }
    return device;
  }

  static async getAllDevicesOfLocation(req) {
    const companyId = req.body.company_id;
    const locationId = req.params.id;
    const devices = await database.devices.findAll({
      where: {
        company_id: companyId,
        location_id: locationId,
      },
      include: [
        {
          model: database.locations,
          required: true,
          as: 'locations',
        },
        {
          model: database.devices,
          required: false,
          as: 'gateway',
          include: [{
            model: database.locations,
            required: false,
            as: 'locations',
          }],
        },
      ],
      raw: true,
      nest: true,
    });
    return devices;
  }

  static async updateDevice(req) {
    let oldObj = {};
    let newObj = {};
    let eventName = null;
    const { id } = req.params;
    const gatewayId = req.body.gateway_id;

    const inputObj = { ...req.body };
    delete inputObj.devices_metadata;

    const updatedDeviceBody = { ...inputObj }
    if (req.user_id) {
      updatedDeviceBody.updated_by = req.user_id
    } else {
      updatedDeviceBody.updated_by = req.occupant_id
    }

    const newLocationId = updatedDeviceBody.location_id;

    const deviceToUpdate = await database.devices.findOne({
      where: { id },
      raw: true,
    });
    // call to deviceProvision - start
    if (newLocationId) {
      let newLocation = await LocationsService.getLocation(newLocationId);
      let oldLocation = await LocationsService.getLocation(deviceToUpdate.location_id);
      let role = null;
      //only call when device moved from site to other children locations
      // if ((oldLocation.location_type.name === 'site' && SITE_CHILD_LOCS.includes(newLocation.location_type.name))) {
      role = ROLES.site;
      let adminData = this.getAdminData(req.company_id);
      let inputDetails = await this.getProvisionDetails(newLocationId, role, DPCommands.share, req.company_id);
      this.updateSharerListOnDeviceLocationUpdation(inputDetails, newLocationId,
        deviceToUpdate.device_code, deviceToUpdate.type, req.company_id, req.user_id, adminData, req.request_id);
      // }
    }
    // call to deviceProvision - end
    if (deviceToUpdate) {
      const typeOfDeviceToUpdate = deviceToUpdate.type;
      if (gatewayId && gatewayId !== null && gatewayId !== 'null') {
        let deviceToLink = await getOneFromCache(CacheKeys.DEVICES, gatewayId);
        if (!deviceToLink) {
          deviceToLink = await database.devices.findOne({
            where: { id: gatewayId },
            raw: true,
          });
        }
        if (deviceToLink && deviceToLink.type !== 'gateway') {
          throw Error(JSON.stringify({ error: '800011' }));
        }
        if (typeOfDeviceToUpdate === 'gateway' && gatewayId) {
          throw Error(JSON.stringify({ error: '800010' }));
        }
      }

      const updateDevice = await database.devices.update(updatedDeviceBody, {
        where: { id },
        returning: true,
        plain: true,
      }).then(async () => {
        const updatedDevice = await database.devices.findOne({
          where: { id },
        });
        Object.keys(updatedDeviceBody).forEach((key) => {
          if (updatedDeviceBody.hasOwnProperty(key) && deviceToUpdate[key] != updatedDeviceBody[key]) {
            oldObj[key] = deviceToUpdate[key];
            newObj[key] = updatedDeviceBody[key];
          }
        });
        const obj = {
          old: oldObj,
          new: newObj,
        };
        if (deviceToUpdate.location_id !== updatedDevice.location_id) {
          eventName = Entities.devices.event_name.device_location_updated;
        } else {
          eventName = Entities.devices.event_name.updated;
        }
        if (JSON.stringify(oldObj) !== JSON.stringify(newObj)) {
          ActivityLogs.addActivityLog(Entities.devices.entity_name, eventName,
            obj, Entities.notes.event_name.updated, deviceToUpdate.id, req.body.company_id, req.user_id, null, null, req.source_IP);
        }
        return updatedDevice;
      });
      if (req.body.devices_metadata) {
        let metadata = req.body.devices_metadata
        let metaObj = {}
        for (let ele of metadata) {
          metaObj[ele.key] = ele.value
        }
        await this.updatedDevicesMetadata(metaObj, id, req.occupant_id, req.body.company_id, req.user_id, req.source_IP).catch((err) => {
          throw (err);
        });
      }
      const getDeviceData = await database.devices.findOne({
        include: [{
          attributes: ['id', 'key', 'value'],
          model: database.devices_metadata,
        }],
        where: { id },
      }).catch((err) => {
        throw (err);
      });
      return getDeviceData;
    }
    return null;
  }

  static async updatedDevicesMetadata(metadata, device_id, occupantId, companyId, userId, source_IP) {
    const keys = Object.keys(metadata);
    for (const key of keys) {
      let value = metadata[key];
      if (value) {
        value = value.toString();
      }
      const getMetaData = await database.devices_metadata.findOne({
        where: {
          key,
          device_id
        },
        raw: true,
      }).catch((err) => {
        throw (err);
      });
      if (getMetaData) {
        const update = {
          key,
          value,
        };
        const updateMetaData = await database.devices_metadata.update(update, {
          where: {
            id: getMetaData.id,
          },
          returning: true,
          raw: true,
        }).then((result) => result).catch((err) => {
          throw (err);
        });
        if (updateMetaData) {
          const updatedData = await database.devices_metadata.findOne({
            where: {
              id: getMetaData.id,
            },
            raw: true,
          }).catch((err) => {
            throw (err);
          });
          const objOld = {};
          const objNew = {};
          Object.keys(update).forEach((key) => {
            if (JSON.stringify(getMetaData[key]) !== JSON.stringify(updatedData[key])) {
              objOld[key] = getMetaData[key];
              objNew[key] = updatedData[key];
            }
          });
          const obj = {
            old: objOld,
            new: objNew,
          };
          const deletedExistingData = { ...getMetaData };
          delete deletedExistingData.updated_at;
          const deletedAfterUpdate = updatedData;
          delete deletedAfterUpdate.updated_at;
          if (JSON.stringify(deletedExistingData) !== JSON.stringify(deletedAfterUpdate)) {
            ActivityLogs.addActivityLog(Entities.devices_metadata.entity_name, Entities.devices_metadata.event_name.updated,
              obj, Entities.notes.event_name.updated, getMetaData.id, companyId, userId, occupantId, null, source_IP);
          }
        }
      } else {
        const addMetaData = await database.devices_metadata.create({
          key,
          value,
          device_id,
        }).then((result) => result).catch((err) => {
          throw (err);
        });
        if (addMetaData) {
          const obj = {
            old: {},
            new: addMetaData,
          };
          ActivityLogs.addActivityLog(Entities.devices_metadata.entity_name, Entities.devices_metadata.event_name.added,
            obj, Entities.notes.event_name.added, addMetaData.id, companyId, userId, occupantId, null, source_IP);
        }
      }
    }
  }

  static async updateBulkDevices(req) {
    const { devices } = req.body;
    const errorDevices = [];
    const resultArray = [];
    for (let index = 0; index < devices.length; index += 1) {
      const device = devices[index];

      const obj = {
        body: device,
        user_id: req.user_id,
        params: {
          id: device.id,
        },
      };
      delete obj.body.id;
      obj.body.company_id = req.body.company_id;
      const deviceresult = await this.updateDevice(obj).catch(() => {
        errorDevices.push(device);
      });

      if (deviceresult) {
        resultArray.push(deviceresult);
      } else {
        errorDevices.push(device);
      }
    }
    return { successDevices: resultArray, errorDevices };
  }

  static async unlinkDeviceLocation(device, req) {
    const locationId = device.location_id;
    let oldLocation = {};
    const getDevice = await database.devices.findOne({
      where: { id: device.id },
      raw: true,
    });
    const prior_locationId = getDevice.location_id;
    const getLocationData = await LocationsService.getLocation(prior_locationId);
    const unlink_obj = {
      old: getDevice,
      new: {},
    };
    if (prior_locationId && JSON.stringify(prior_locationId) !== JSON.stringify(locationId)) {
      // call deviceProvision api - start
      const currLoc = await LocationsService.getLocation(locationId);
      // if (!currLoc || currLoc.location_type.name === 'site') {// check if new location is different then building/area. because we only need to unshare if device it is being moved from building/area to site/none
      let role = currLoc.location_type.name === 'site' ? ROLES.site : null;
      let adminData = await this.getAdminData(req.company_id);
      let inputDetails = await this.getProvisionDetails(prior_locationId, role, DPCommands.unshare, req.company_id);
      this.updateSharerListOnDeviceLocationUpdation(inputDetails, prior_locationId, getDevice.device_code, getDevice.type,
        req.company_id, req.user_id, adminData, req.request_id);
      // }
      // call deviceProvision api - end

      let Unlinked = Entities.locations.event_name.device_unlinked;
      ActivityLogs.addActivityLog(Entities.locations.entity_name, Unlinked,
        unlink_obj, Entities.notes.event_name.updated, getLocationData.id, device.company_id, req.user_id, null, null, req.source_IP);
    }
    const updateDevice = await database.devices.update(device, {
      where: { id: device.id },
      returning: true,
      plain: true,
    }).then(async () => {
      const updatedDevice = await database.devices.findOne({
        include: [
          {
            required: false,
            model: database.locations,
            as: 'locations',
          },
          {
            required: false,
            model: database.devices,
            as: 'gateway',
          },
        ],
        where: { id: device.id },
      });
      if (prior_locationId) {
        oldLocation = getLocationData;
      } else {
        oldLocation = {};
      }
      const link_obj = {
        old: {},
        new: updatedDevice,
      };
      if (JSON.stringify(locationId) !== JSON.stringify(prior_locationId)) {
        let Linked = Entities.locations.event_name.device_linked;
        ActivityLogs.addActivityLog(Entities.locations.entity_name, Linked,
          link_obj, Entities.notes.event_name.updated, updatedDevice.location_id, device.company_id, req.user_id, null, null, req.source_IP);
      }
      const updated_obj = {
        old: oldLocation,
        new: updatedDevice.locations,
      };
      if (JSON.stringify(locationId) !== JSON.stringify(prior_locationId)) {
        ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.locations.event_name.updated,
          updated_obj, Entities.notes.event_name.updated, updatedDevice.id, device.company_id, req.user_id, null, null, req.source_IP);
      }
      return updatedDevice;
    }).catch(() => {
      throw Error(JSON.stringify({ error: '8000061' }));
    });
    return updateDevice;
  }

  static async updateMultipleDevice(req) {
    const { body } = req;
    const { ids } = req.body;
    const updatedDeviceBody = req.body;
    delete updatedDeviceBody.ids;
    const gatewayId = req.body.gateway_id;
    updatedDeviceBody.updated_by = req.user_id;
    let newLocationId = body.location_id;

    const newLocation = await database.locations.findOne({
      include: [
        {
          required: true,
          model: database.location_types,
          as: 'location_type',
        },
      ],
      where: { id: newLocationId },
      raw: true,
      nest: true,
    });

    const oldList = await database.devices.findAll({
      include: [
        {
          required: false,
          model: database.locations,
          as: 'locations',
          include: [
            {
              required: false,
              model: database.location_types,
              as: 'location_type',
            },
          ],
        },
        {
          required: false,
          model: database.devices,
          as: 'gateway',
        },
      ],
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      raw: true,
      nest: true,
    });
    if (oldList.length > 0 && oldList.length === ids.length) {
      if (gatewayId && gatewayId !== null && gatewayId !== 'null') {
        let deviceToLink = await getOneFromCache(CacheKeys.DEVICES, gatewayId);
        if (!deviceToLink) {
          deviceToLink = await database.devices.findOne({
            where: { id: gatewayId },
            raw: true,
          });
        }
        if (deviceToLink && deviceToLink.type !== 'gateway') {
          throw Error(JSON.stringify({ error: '800011' }));
        }
      }
      for (let i = 0; i < oldList.length; i += 1) {
        const deviceToUpdate = oldList[i];
        const typeOfDeviceToUpdate = deviceToUpdate.type;
        if (typeOfDeviceToUpdate === 'gateway' && gatewayId) {
          throw Error(JSON.stringify({ error: '800010' }));
        }
      }
      let adminData = await this.getAdminData(req.company_id);
      let role = ROLES.site;// we can only move devices in child locations so device will never be assined to site individually. it will be either unlinked op or gateway location updated.
      let inputDetails = await this.getProvisionDetails(newLocationId, role, DPCommands.share, req.company_id);
      if (newLocation) {
        for (let i = 0; i < oldList.length; i += 1) {
          let d = oldList[i];
          if (d.locations.location_type.name === 'site' && SITE_CHILD_LOCS.includes(newLocation.location_type.name)) {
            this.updateSharerListOnDeviceLocationUpdation(inputDetails, newLocationId, d.device_code, d.type,
              req.company_id, req.user_id, adminData, req.request_id);
          }
        }
      }
      const updatedDevices = await database.devices.update(updatedDeviceBody, {
        where: {
          id: {
            [Op.in]: ids,
          },
        },
        returning: true,
        plain: true,
      }).then(async () => {
        const newList = await database.devices.findAll({
          include: [
            {
              required: false,
              model: database.locations,
              as: 'locations',
            },
            {
              required: false,
              model: database.devices,
              as: 'gateway',
            },
          ],
          where: {
            id: {
              [Op.in]: ids,
            },
          },
        });
        newList.forEach((newDevice) => {
          let oldObj = {};
          let newObj = {};
          const oldDevice = lodash.filter(oldList, [
            'id',
            newDevice.id,
          ]);
          oldObj = oldDevice[0].gateway;
          newObj = newDevice.gateway;
          const obj = {
            old: oldObj,
            new: newObj,
          };
          ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.multiple_updated,
            obj, Entities.notes.event_name.updated, newDevice.id, body.company_id, req.user_id, null, null, req.source_IP);
        });
        return newList;
      });
      // pin the device code shld be written here
      // new implementation for occupant_checkin permission removal
      // check if current location type is "room" or not
      let locationTypeName = newLocation.location_type.name;
      if (locationTypeName && locationTypeName === 'room') {
        // satrted job for linking device to the occupants.
        const createdBy = req.user_id;
        const updatedBy = req.user_id;
        let input = {
          ids,
          locationId: newLocationId,
          accessToken: adminData.accessToken,
          adminIdentityId: adminData.identityId,
        }
        await jobsService.createJob('linkDevicesToTheOccupants', input, req.company_id, createdBy, updatedBy, null, req.request_id)
          .then(async (resp) => resp)
          .catch((err) => {
            throw (err);
          });
      }
      return updatedDevices;
    }
    return null;
  }

  static async deleteDevice(device_id, company_id, occupant_id, user_id, source_IP, request_id) {
    await this.checkDeviceExists(device_id, company_id).then(async (device) => {
      if (device && device.type == 'gateway') {
        const err = ErrorCodes['800035'];
        throw err;
      }
      //if exists delete device and type is not gateway then delete
      if (device && device.type != 'gateway') {
        let promiseList = []
        //delete records from single_controls and single_control_devices
        const getSingleControlAndDevices = await database.single_controls.findOne({
          where: {
            default_device_id: device_id
          },
          include: [
            {
              model: database.single_control_devices,
            }
          ],
          order: [
            [database.single_control_devices, 'created_at', 'asc'],
          ],
        }).catch(() => {
          const err = ErrorCodes['420004'];
          throw err;
        });
        //if no data in SC then find the data in SCD
        if (!getSingleControlAndDevices) {
          const getSingleControlDevices = await database.single_control_devices.findOne({
            where: {
              device_id
            },
          }).catch(() => {
            const err = ErrorCodes['420004'];
            throw err;
          });
          if (getSingleControlDevices) {
            promiseList.push(await database.single_control_devices.destroy({
              where: {
                device_id
              }
            }).catch(() => {
              const err = ErrorCodes['420006'];
              throw err;
            }))
          }
        }
        // assigning SCD array and checking Gateway present or not

        const gateway = await database.devices.findOne({
          where: { id: device.gateway_id },
          raw: true,
        }).catch(() => {
          const err = ErrorCodes['800013'];
          throw err;
        });
        if (!gateway) {
          const err = ErrorCodes['800013'];
          throw err;
        }

        let gatewayExist = null;
        let singleControlDevicesArray = [];
        let exDefaultDevices = [];

        if (getSingleControlAndDevices && getSingleControlAndDevices.single_control_devices && getSingleControlAndDevices.single_control_devices.length > 0) {
          singleControlDevicesArray = getSingleControlAndDevices.single_control_devices;
          // check valid gateway_id
          gatewayExist = await database.devices.findOne({
            where: { id: getSingleControlAndDevices.gateway_id },
            raw: true,
          }).catch(() => {
            const err = ErrorCodes['800013'];
            throw err;
          });
          if (!gatewayExist) {
            const err = ErrorCodes['800013'];
            throw err;
          };

          // if SC and SCD data is == 1 delete from both
          if (singleControlDevicesArray.length == 1) {
            for (const key in singleControlDevicesArray) {
              const element = singleControlDevicesArray[key];
              // check if the device id matches with the default device id then delete the record from SCD
              if (device_id == element.device_id) {
                promiseList.push(await database.single_control_devices.destroy({
                  where: {
                    device_id: element.device_id
                  }
                }).catch(() => {
                  const err = ErrorCodes['420006'];
                  throw err;
                }))
              }
            }
            promiseList.push(await database.single_controls.destroy({
              where: {
                id: getSingleControlAndDevices.id, default_device_id: getSingleControlAndDevices.default_device_id
              }
            }).catch(() => {
              const err = ErrorCodes['420007'];
              throw err;
            }))
          }
          // if SC has a data and SCD has multiple records then update
          if (singleControlDevicesArray.length > 1) {
            for (const key in singleControlDevicesArray) {
              const element = singleControlDevicesArray[key];
              // check if the device id matches with the default device id then delete the record from SCD
              if (device_id == element.device_id) {
                promiseList.push(await database.single_control_devices.destroy({
                  where: {
                    device_id: element.device_id
                  }
                }).catch(() => {
                  const err = ErrorCodes['420006'];
                  throw err;
                }))
              } else {
                exDefaultDevices.push(element);
              }
            };

            // if element is present in excluded array then update SC
            if (exDefaultDevices.length >= 1) {
              //update
              const new_default_device_id = exDefaultDevices[0].device_id;
              // creeting reference in device_references.
              const createDeviceReferenceObj = await this.addDeviceReference(new_default_device_id);
              if (!createDeviceReferenceObj) {
                const err = ErrorCodes['410006'];
                throw err;
              }
              const ref = createDeviceReferenceObj.id;
              const host = process.env.SERVICE_API_HOST;
              const url = `https://${host}/api/v1/schedules/device_schedules?ref=${ref}`;
              let defaultDevice = await database.devices.findOne({
                where: { id: new_default_device_id },
                raw: true,
              }).catch(() => {
                const err = ErrorCodes['800019'];
                throw err;
              });
              await SchedulesService.publishGenScheURL(company_id, defaultDevice.device_code, url);
              const update_SC = await database.single_controls.update({ default_device_id: new_default_device_id }, {
                where: { id: getSingleControlAndDevices.id }
              }).catch(() => {
                const error = ErrorCodes['420005'];
                throw error;
              });
            }
          }
          // creating reference in device rule_reference
          const deviceReferenceObj = await OneTouchRulesService.addDeviceReference(getSingleControlAndDevices.gateway_id);
          if (!deviceReferenceObj) {
            const err = ErrorCodes['330005'];
            throw err;
          }
          const ref = deviceReferenceObj.id;
          const host = process.env.SERVICE_API_HOST || 'dev-service.ctiotsolution.com';
          const url = `https://${host}/api/v1/one_touch/gateway_rules?ref=${ref}`;
          await OneTouchRulesService.publishJsonUrl(company_id, gatewayExist.device_code, url);
        }

        // delete activitylogs which are connected to this devices
        promiseList.push(await this.deleteActivityLogs(device_id))
        // await this.deleteActivityLogs(device_id);
        //delete the devices from occupant groups devices
        promiseList.push(await this.deleteoccpantsGroupsDevices(device_id))

        //delete the predefined rules
        promiseList.push(await database.predefined_rules.destroy({
          where: {
            [Op.or]: [{
              source_device_id: device.id
            },
            {
              target_device_id: device.id
            }
            ]
          },
          returning: true,
        }).catch(() => {
          const err = ErrorCodes['800030'];
          throw err;
        }))

        //delete device alerts
        promiseList.push(await database.device_alerts.destroy({
          where: {
            device_id: device.id
          },
          returning: true,
        }).catch(() => {
          const err = ErrorCodes['800031'];
          throw err;
        }))

        //delete alert communication configs
        promiseList.push(await database.alert_communication_configs.destroy({
          where: {
            device_id: device.id
          },
          returning: true,
        }).catch(() => {
          const err = ErrorCodes['800032'];
          throw err;
        }))
        //delete device record from device_events
        // promiseList.push(await database.device_events.destroy({
        //   where: {
        //     device_code: device.device_code
        //   },
        //   returning: true,
        // }).catch(() => {
        //   const err = ErrorCodes['800034'];
        //   throw err;
        // }));

        let input = {
          device_code: device.device_code, "deleted_at": new Date().toISOString(), "retry_count": 0
        }
        await jobsService.createJob('deleteDeviceEvents', input, company_id, null, null, null, request_id)
          .then(async (resp) => resp)
          .catch((error) => {
            const err = ErrorCodes['800034'];
            throw (err);
          });
        //delete device record from device_events
        let categoryb_enabled = process.env.CATEGORYB_ENABLED;
        // if (categoryb_enabled == true || categoryb_enabled == 'true') {

        promiseList.push(await categoryb_database.device_events.destroy({
          where: {
            device_code: device.device_code
          },
          returning: true,
        }).catch(() => {
          const err = ErrorCodes['800034'];
          throw err;
        }));

        // }
        //delete device history from redshifts
        if (process.env.REDSHIFT_DB_NAME && process.env.REDSHIFT_DB_USER && process.env.REDSHIFT_DB_PASSWORD && process.env.REDSHIFT_DB_HOST && parseInt(process.env.REDSHIFT_DB_PORT)) {
          console.log("redshift delete device history data", device.device_code, process.env.REDSHIFT_DB_NAME)
          promiseList.push(
            await executeQuery(`DELETE FROM app_aggregates.device_events where  device_code = '${device.device_code}'`)
              .catch(() => {
                const err = ErrorCodes['490000'];
                throw err;
              })
          )
        }
        //delete occupant dashboard attributes
        promiseList.push(await this.deleteOccupantsDashboardAttributes(device_id, company_id).catch((err) => {
          throw err;
        }));

        //delete device status history
        // promiseList.push(await this.deleteDeviceStatusHistories(device.device_code, company_id).catch((err) => {
        //   throw err;
        // }));

        //delete device schedules
        promiseList.push(await this.deleteDeviceSchedules(device_id, company_id).catch((err) => {
          throw err;
        }));

        //delete device from device_references
        promiseList.push(await this.deleteDeviceReferences(device_id).catch((err) => {
          throw err;
        }));

        //delete one_touch_rules for device
        // if (device.gateway_id) {
        //   await database.one_touch_rules.findAll(
        //     {
        //       where: {
        //         gateway_id: device.gateway_id
        //       }, returning: true,
        //     }
        //   ).then(async (data) => {
        //     if (data && data.length > 0) {
        //       let ids = [];
        //       for (let element in data) {
        //         const item = data[element];
        //         let rule = item.rule
        //         let StrngifyRule = JSON.stringify(rule);
        //         if (rule.hasOwnProperty('name')) {
        //           if (rule['name'].startsWith('_P65FD8T6S') === true) {
        //             const splitArr = device.device_code.split('-');
        //             if (splitArr.length > 2) {
        //               let device_mac_address = `${splitArr[3]}`;
        //               device_mac_address = new RegExp(device_mac_address, "i")
        //               if (StrngifyRule.match(device_mac_address) !== null) {
        //                 ids.push(item.id);
        //               }
        //             }
        //           }
        //         }
        //       }
        //       if (ids.length > 0) {
        //         await this.deleteOneTouchRules(ids).catch(err => {
        //           throw err;
        //         });
        //         const gateway = await database.devices.findOne({
        //           where: { id: device.gateway_id },
        //           raw: true,
        //         }).then((result) => result);
        //         const oneTouchReferenceObj = await this.addDeviceReference(device.gateway_id);
        //         if (!oneTouchReferenceObj) {
        //           const err = ErrorCodes['330005'];
        //           throw err;
        //         }
        //         const ref = oneTouchReferenceObj.id;
        //         const host = process.env.SERVICE_API_HOST ;
        //         const url = `https://${host}/api/v1/one_touch/gateway_rules?ref=${ref}`;
        //          await OneTouchRulesService.publishJsonUrl(company_id, gateway.device_code, url);
        //       }
        //     }
        //   }).catch(err => {
        //     throw err;
        //   });
        // }
        await Promise.all(promiseList).then((results) => {
          return results
        }).catch(error => {
          // const err = ErrorCodes['160033'];
          throw error;
        });

        // delete record from smartplug energymeter app_smartplug app_energymeter
        try {
          let device_code = device.device_code
          var smartplugModelList = ['SPE600', 'SAL2', 'SP600', 'SX885ZB'];
          var energymeterModelList = ['SAL2EM1', 'ECM600'];
          if (smartplugModelList.includes(device.model)) {
            await database.sequelize.query('delete from smartplug where dsnid = :device_code',
              {
                raw: true,
                replacements: { device_code },
                logging: console.log,
              })

            await database.sequelize.query('delete from app_smartplug where dsnid = :device_code',
              {
                raw: true,
                replacements: { device_code },
                logging: console.log,
              })
          }
          if (energymeterModelList.includes(device.model)) {
            await database.sequelize.query('delete from energymeter where dsnid = :device_code',
              {
                raw: true,
                replacements: { device_code },
                logging: console.log,
              })

            await database.sequelize.query('delete from app_energymeter where dsnid = :device_code',
              {
                raw: true,
                replacements: { device_code },
                logging: console.log,
              })
          }
        }
        catch (error) {
        }
        //add it to cache
        await setInCache("DeleteDevice", device.device_code, device_id)
        //finally delete device
        const deleteDevice = await this.deleteDeviceOrGateway(device_id)
          .then(async (result) => {
            const splitArr = device.device_code.split('-');
            const GatewayID = `${splitArr[0]}-${splitArr[1]}`;
            return result
          }).catch(() => {
            const err = ErrorCodes['800028'];
            throw err;
          });

        //get the device shadow
        var deviceShadow = await this.getThingShadow(device.device_code, company_id).catch(err => { console.log(err); throw err; })
        const LeaveNetwork = Object.keys(deviceShadow.properties).filter((name) => name.endsWith(":LeaveNetwork"));

        if (LeaveNetwork.length > 0) {
          const publishCommand = LeaveNetwork[0].split(':')[1] + ':SetLeaveNetwork'
          await this.factoryResetGateway(company_id, device.device_code, publishCommand)
            .catch(err => {
              throw err;
            });
        }

        var obj = {
          new: {},
          old: device
        }

        if (deviceShadow && (deviceShadow.connected == false || deviceShadow.connected == 'false')) {
          var leaveNetworkKey = Object.keys(deviceShadow.properties).filter((name) => name.endsWith(":LeaveNetwork"));
          var leaveRequestDKey = Object.keys(deviceShadow.properties).filter((name) => name.endsWith(":LeaveRequest_d"));
          if ((leaveNetworkKey && deviceShadow.properties[leaveNetworkKey] == 1) || (leaveRequestDKey && deviceShadow.properties[leaveRequestDKey] == 1)) {
            var params = {
              thingName: device.device_code, /* required */
            };
            const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'deleteThingShadow').then((data) => data);
            const thingData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'deleteThing').then((data) => data);
          }
        }
        ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.deleted,
          obj, Entities.notes.event_name.deleted, company_id, company_id, user_id, occupant_id, null, source_IP);

        const formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

        let deviceListChanged = {
          "deviceListChanged": {
            "event": true,
            "eventTime": formattedDateTime,
          }
        }
        await this.publishSyncBlockProperty(company_id, gateway.device_code, deviceListChanged)

        return deleteDevice
      }
      return null;
    }).catch((err) => {
      throw err;
    })
  }

  static async deleteOccupantPermissions(gateway_id, occupant_id, company_id, occupant_email, source_IP) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    var reqObj = {
      body: {
        company_id
      }
    }
    const AdminData = await UserService.cognitoLogin(reqObj, email, password);
    //get all occupants permissions,with occuoants details
    var occupantsPermissions = await database.occupants_permissions.findAll({
      include: [{
        required: true,
        attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number', 'identity_id', 'cognito_id'],
        model: database.occupants,
        as: 'receiver_occupant',
      }, {
        model: database.devices,
        as: 'gateway',
      }],
      where: {
        gateway_id
      }
    }).catch(error => {
      const err = ErrorCodes['490003'];
      throw err;
    })
    await database.devices.update({ location_id: null }, {
      where: { [Op.or]: [{ id: gateway_id }, { gateway_id }] }
    }).catch((err) => {
      throw err;
    });
    var permissionsToDelete = await database.occupants_permissions.findAll({
      where: {
        gateway_id,
        receiver_occupant_id: null,

      }
    }).catch(error => {
      const err = ErrorCodes['490003'];
      throw err;
    })
    if (permissionsToDelete && permissionsToDelete.length > 0) {
      let ids = lodash.map(permissionsToDelete, 'id');
      await database.occupants_permissions.destroy(
        {
          where: { id: { [Op.in]: ids } }
        }).catch(error => {
          const err = ErrorCodes['160028'];
          throw err;
        });

      for (const element of permissionsToDelete) {
        let obj = {
          old: element,
          new: {},
        };
        const placeholdersData = {};
        ActivityLogs.addActivityLog(Entities.occupants_permissions.entity_name,
          Entities.occupants_permissions.event_name.deleted,
          obj, Entities.notes.event_name.deleted, occupant_id, company_id, null, occupant_id, placeholdersData, source_IP);
      }
    }
    if (occupantsPermissions && occupantsPermissions.length > 0) {
      let calledByAPI = false;
      for (const element of occupantsPermissions) {
        if (element.receiver_occupant_id == element.sharer_occupant_id) {
          await DeviceProvisionService.sleep(500)
          await OccupantsPermissionsService.deleteOccupantsPermissions(element.id, occupant_id, company_id, AdminData.accessToken, AdminData.identityId, DPCommands.adminunshare, occupant_email, calledByAPI, source_IP)
            .catch((err) => {
              throw err;
            });
        } else {
          await DeviceProvisionService.sleep(500)
          await OccupantsPermissionsService.deleteOccupantsPermissions(element.id, occupant_id, company_id, AdminData.accessToken, AdminData.identityId, DPCommands.unshare, occupant_email, calledByAPI, source_IP)
            .catch((err) => {
              throw err;
            });
        }
      }
      return true;
    } else {
      return true;
    }
  }

  //new function for array publish command
  static async publishDeviceNameArray(company_id, device_code, publishData) {
    var params = {
      thingName: device_code, /* required */
    };
    const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
    if (!shadowData) {
      // gateway shadow not updated
      // const err = ErrorCodes['330005'];
      // throw err;
      return { success: false };
    }
    var payload = JSON.parse(shadowData.payload);
    let base_key = null;
    const { reported } = payload.state; // array
    let base = null;
    if (!reported) {
      return { success: false };
    }
    Object.keys(reported).forEach((key) => {
      if (reported[key].hasOwnProperty('properties')) {
        const { properties } = reported[key];
        base_key = key;
        if (Object.keys(properties).length > 0) {
          base = Object.keys(properties)[0];
        }
      }
    });
    if (!base) {
      // const err = ErrorCodes['330005'];
      // throw err;
      return { success: false };
    }

    // check with base property
    if (publishData && publishData.length > 0) {

      const baseSplitArray = base.split(':');
      var payload = {
        state:
        {
          desired: {},
        },
      };
      payload.state.desired[base_key] = {
        properties:
          {},
      };
      for (const key in publishData) {
        const element = publishData[key];
        const keyEle = element.Name;
        const keyVal = element.Value;
        payload.state.desired[base_key].properties[keyEle] = keyVal;
      }
      if (Object.keys(payload.state.desired[base_key].properties).length > 0) {
        const topic = `$aws/things/${device_code}/shadow/update`;
        var params = {
          topic,
          payload: JSON.stringify(payload),
        };
        const publishShadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'publish').then((data) => data);
        if (!publishShadowData) {
          // not published the url
          const err = ErrorCodes['800021'];
          throw err;
        }
      }
      return { success: true };
    }
  }

  static async publishDeviceName(company_id, device_code, property, property_value) {
    var params = {
      thingName: device_code, /* required */
    };
    const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
    if (!shadowData) {
      // gateway shadow not updated
      // const err = ErrorCodes['330005'];
      // throw err;
      return { success: false };
    }
    var payload = JSON.parse(shadowData.payload);
    let base_key = null;
    const { reported } = payload.state; // array
    let base = null;
    if (!reported) {
      return { success: false };
    }
    Object.keys(reported).forEach((key) => {
      if (reported[key].hasOwnProperty('properties')) {
        const { properties } = reported[key];
        base_key = key;
        if (Object.keys(properties).length > 0) {
          base = Object.keys(properties)[0];
        }
      }
    });
    if (!base) {
      // const err = ErrorCodes['330005'];
      // throw err;
      return { success: false };
    }
    const baseSplitArray = base.split(':');
    const setProperty = `${baseSplitArray[0]}${property}`;
    var payload = {
      state:
      {
        desired: {},
      },
    };
    payload.state.desired[base_key] = {
      properties:
        {},
    };

    payload.state.desired[base_key].properties[setProperty] = property_value;

    const topic = `$aws/things/${device_code}/shadow/update`;
    var params = {
      topic,
      payload: JSON.stringify(payload),
    };

    const publishShadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'publish').then((data) => data);
    if (!publishShadowData) {
      // not published the url
      const err = ErrorCodes['800021'];
      throw err;
    }
    return { success: true };
  }

  static async factoryResetGateway(company_id, device_code, publishCommand) {
    var params = {
      thingName: device_code, /* required */
    };
    const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
    if (!shadowData || (shadowData && !shadowData.payload)) {
      // gateway shadow not updated
      const err = ErrorCodes['330005'];
      throw err;
    }
    var payload = JSON.parse(shadowData.payload);
    let base_key = null;
    const { reported } = payload.state; // array
    let base = null;
    Object.keys(reported).forEach((key) => {
      if (reported[key].hasOwnProperty('properties')) {
        const { properties } = reported[key];
        base_key = key;
        if (Object.keys(properties).length > 0) {
          base = Object.keys(properties)[0];
        }
      }
    });
    if (!base) {
      const err = ErrorCodes['330005'];
      throw err;
    }
    const baseSplitArray = base.split(':');
    const settFactoryReset = `${baseSplitArray[0]}:${publishCommand}`;
    var payload = {
      state:
      {
        desired: {},
      },
    };
    payload.state.desired[base_key] = {
      properties:
        {},
    };
    payload.state.desired[base_key].properties[settFactoryReset] = 1;
    const topic = `$aws/things/${device_code}/shadow/update`;
    var params = {
      topic,
      payload: JSON.stringify(payload),
    };
    const publishShadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'publish').then((data) => data);
    if (!publishShadowData) {
      // not published the url
      const err = ErrorCodes['800021'];
      throw err;
    }
    return { success: true };
  }

  static async deleteOccupantGroup(id, gateway_id, occupant_id, company_id, groupObj, source_IP) {
    await database.occupants_groups.destroy({
      where: {
        id,
        item_id: gateway_id,
      },
    }).then(async (result) => {
      await database.occupants_groups_devices.destroy({
        where: {
          occupant_group_id: id
        },
      }).catch(() => {
        const err = ErrorCodes['160033'];
        throw err;
      });
      return result
    }).catch(() => {
      const err = ErrorCodes['160033'];
      throw err;
    });
    const obj = {
      old: groupObj,
      new: {},
    };
    ActivityLogs.addActivityLog(Entities.occupants_groups.entity_name,
      Entities.occupants_groups.event_name.deleted,
      obj, Entities.notes.event_name.deleted, occupant_id, company_id, null, occupant_id, null, source_IP);
    return true
  }

  static async deleteGatewayOccupantGroups(gateway_id, occupant_id, company_id, source_IP) {
    //delete gateway one by one
    var groups = await database.occupants_groups.findAll({
      where: {
        item_id: gateway_id,
      },
    }).catch((error) => {
      const err = ErrorCodes['160033'];
      throw err;
    });
    if (groups && groups.length > 0) {
      var promiseList = []
      var itemIds = []
      for (const group of groups) {
        itemIds.push(group.id)
        promiseList.push(await this.deleteOccupantGroup(group.id, gateway_id, occupant_id, company_id, group, source_IP))
      }
      //delete groups dashboard attributes
      await this.deleteDashboardAttributes(itemIds, company_id).catch(err => {
        throw err;
      });
      await Promise.all(promiseList).then((results) => {
        return results
      }).catch(error => {
        const err = ErrorCodes['160033'];
        throw err;
      });
      return true
    } else {
      return true
    }
  }

  static async deleteDashboardAttributes(item_ids, company_id) {
    const deletedData = await database.occupants_dashboard_attributes.destroy({
      where: {
        item_id: {
          [Op.in]: item_ids
        }, company_id
      },
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['160041'];
      throw err;
    });
    return deletedData
  }
  static async deleteActivityLogs(entity_id, jobId) {
    await database.activity_logs.destroy({
      where: {
        entity_id,
        event_name: {
          [Op.notIn]: [Entities.devices.event_name.added,
          Entities.devices.event_name.gateway_added,
          Entities.devices.event_name.owner_unregistered_gateway,
          Entities.devices.event_name.gateway_unregistered,
          Entities.devices.event_name.deleted,
          Entities.devices.event_name.gateway_deleted]
        }
      }
    }).then(result => {
      return (result)
    }).catch(() => {
      const err = ErrorCodes['800023'];
      throw err;
    });
  }

  static async deleteoccpantsGroupsDevices(device_id) {
    let occupantGroupsDevice = await database.occupants_groups_devices.findOne(
      { where: { device_id } }
    ).catch(() => {
      const err = ErrorCodes['800037'];
      throw err;
    });
    if (occupantGroupsDevice) {
      await database.occupants_groups_devices.destroy(
        { where: { device_id } }
      ).then(result => {
        return result;
      }).catch(() => {
        const err = ErrorCodes['800029'];
        throw err;
      });
      let groupId = occupantGroupsDevice.occupant_group_id;
      const groupDevices = await database.occupants_groups_devices.count({
        where: {
          occupant_group_id: groupId
        },
      }).catch(() => {
        const err = ErrorCodes['800037'];
        throw err;
      });
      if (groupDevices <= 0) {
        await database.occupants_groups.destroy(
          {
            where: {
              id: groupId
            },
            returning: true,
          }
        ).then(async (result) => {
          return result;
        }).catch(() => {
          const err = ErrorCodes['160033'];
          throw err;
        });
      }
    }
  }

  static async deleteOccupantsDashboardAttributes(id, company_id) {
    await database.occupants_dashboard_attributes.destroy({
      where: {
        item_id: id,
        company_id
      }, returning: true
    }).then(result => {
      return (result)
    }).catch(() => {
      const err = ErrorCodes['800024'];
      throw err;
    })
  }

  // static async deleteDeviceStatusHistories(deviceCode, company_id) {
  //   var ids = await database.device_status_histories.findAll({
  //     where: {
  //       'device.device_code': {
  //         [Op.iLike]: deviceCode,
  //       }, company_id
  //     }
  //   }).then(result => {
  //     if (!result) {
  //       return [];
  //     }
  //     var ids = []
  //     for (const element of result) {
  //       ids.push(element.id)
  //     }
  //     return ids
  //   }).catch((error) => {
  //     // const err = ErrorCodes['800025'];
  //     // throw err;
  //     return [];
  //   })
  //   if (ids.length > 0) {
  //     await database.device_status_actions.destroy({
  //       where: {
  //         device_alert_id: {
  //           [Op.in]: ids,
  //         }
  //       }
  //     }).then(result => {
  //       return result;
  //     }).catch((error) => {
  //       // const err = ErrorCodes['800033'];
  //       // throw err;
  //       return [];
  //     })
  //     await database.device_status_histories.destroy({
  //       where: {
  //         'device.device_code': {
  //           [Op.iLike]: deviceCode,
  //         }, company_id
  //       }
  //     }).then(result => {
  //       return result;
  //     }).catch((error) => {
  //       // const err = ErrorCodes['800025'];
  //       // throw err;
  //       return [];
  //     })
  //   }
  //   return ids;
  // }

  static async checkDeviceExists(id, company_id) {
    const checkDeviceExists = await database.devices.findOne({
      where: {
        id
      }
    })
    if (!checkDeviceExists) {
      const err = ErrorCodes['800002'];
      throw err;
    }
    return checkDeviceExists;
  }

  // delete record from schedules
  static async deleteDeviceSchedules(device_id, company_id) {
    await database.schedules.destroy({
      where: { device_id, company_id }
    }).then(result => {
      return (result)
    }).catch(() => {
      const err = ErrorCodes['800027'];
      throw err;
    })
  }

  static async deleteDeviceReferences(device_id) {
    await database.device_references.destroy({
      where: { device_id }
    }).then(result => {
      return (result)
    }).catch(() => {
      const err = ErrorCodes['800026'];
      throw err;
    })
  }

  static async deleteOneTouchRules(ids) {
    await database.one_touch_rules.destroy({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    }).catch(err => {
      Logger.error("Error while deleting the one touch rules", err);
    });
  }

  static async deleteDeviceOrGateway(id) {
    await database.devices.destroy({
      where: {
        id
      }
    }).then(result => {
      return (result)
    }).catch(() => {
      const err = ErrorCodes['800028'];
      throw err;
    })
  }

  static async updateOneTouchCommunicationConfigs(gateway_id,occupant_id,company_id,source_IP) {
    let one_touch_rule_ids = []
    let one_touch_rules = await database.one_touch_rules.findAll({
      where:{
        gateway_id
      }
    }).catch(() => {
      const err = ErrorCodes['330003'];
      throw err;
    })
    if(one_touch_rules){
      one_touch_rule_ids = one_touch_rules.map(element=>element.id)

      let list =  await database.one_touch_communication_configs.findAll({
        where: {
          one_touch_rule_id :{
            [Op.in]:one_touch_rule_ids
          }
        }
      }).then(result => {
        return (result)
      }).catch(() => {
        const err = ErrorCodes['800032'];
        throw err;
      })
  

      await database.one_touch_communication_configs.update({
        phone_numbers:[],
        emails:[]
      },{
        where: {
          one_touch_rule_id :{
            [Op.in]:one_touch_rule_ids
          }
        }
      }).then(result => {
        return (result)
      }).catch(() => {
        const err = ErrorCodes['330007'];
        throw err;
      })

      ActivityLogs.addActivityLog(Entities.one_touch_communication_config.entity_name,
        Entities.one_touch_communication_config.event_name.deleted,
        list, Entities.notes.event_name.deleted, occupant_id, company_id, null, occupant_id, {}, source_IP);
    }
  }

  static async deleteAlertCommunicationConfigs(gateway_id,occupant_id,company_id,source_IP) {
    let device_ids = []
    let devices = await database.devices.findAll({
      where:{
        [Op.or]:[{
          gateway_id
        },
        {
          id:gateway_id
        }]
      }
    }).catch(() => {
      const err = ErrorCodes['800002'];
      throw err;
    })

    if(devices){
      device_ids = devices.map(element=>element.id)
    
    let list =  await database.alert_communication_configs.findAll({
      where: {
        device_id :{
          [Op.in]:device_ids
        }
      }
    }).then(result => {
      return (result)
    }).catch(() => {
      const err = ErrorCodes['800032'];
      throw err;
    })


    await database.alert_communication_configs.destroy({
      where: {
        device_id :{
          [Op.in]:device_ids
        }
      }
    }).then(result => {
      return (result)
    }).catch(() => {
      const err = ErrorCodes['800032'];
      throw err;
    })

    ActivityLogs.addActivityLog(Entities.occupants_alert_config.entity_name,
      Entities.occupants_alert_config.event_name.deleted,
      list, Entities.notes.event_name.deleted, occupant_id, company_id, null, occupant_id, {}, source_IP);
    }
  }

  static async deleteGateway(command, gateway_id, company_id, occupant_id, occupant_email, code, source_IP) {
    const checkGatewayIdExists = await database.devices.findOne({
      where: { id: gateway_id },
    });
    if (!checkGatewayIdExists) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    //Only allow for owner
    const isHavePermission = await database.occupants_permissions.findOne({
      where: {
        receiver_occupant_id: occupant_id,
        gateway_id: gateway_id,
        access_level: 'O',
      },
    });
    if (!isHavePermission) {
      const err = ErrorCodes['160045'];
      throw err;
    }
    if (command == 2 || command == 3) {
      if (checkGatewayIdExists.status == 'offline') {
        const err = ErrorCodes['410008'];
        throw err;
      }
    }
    var occupantsPermissions = await database.occupants_permissions.findAll(
      {
        include: [{
          attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number', 'identity_id', 'cognito_id'],
          model: database.occupants,
          as: 'receiver_occupant',
        },
        {
          attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number', 'identity_id', 'cognito_id'],
          model: database.occupants,
          as: 'sharer_occupant',
        },
        ],
        where: {
          gateway_id,
          receiver_occupant_id: {
            [Op.ne]: null
          }
        }
      }
    ).catch((error) => {
      const err = ErrorCodes['490003'];
      throw err;
    });

    var logObj = {
      new: {},
      old: checkGatewayIdExists
    }
    var emptyDeviceName = "{\"deviceName\":\"\",\"ShortID_d\":0}"
    var emptyAppDataC = "{\"addr\":{\"city\":\"\",\"country\":\"\",\"state\":\"\",\"\":\"\",\"zip\":\"\"},\"photourl\":\"\",\"sensorName\":{\"sensor1\":null}}"
    var propertyDeviceName = ":sZDO:SetDeviceName";
    var propertyAppDataC = ":sZDOInfo:SetAppData_c";
    if (command == 1) {
      //Just call device provision api  and remove record from occupants permissions table for all gateway users
      await this.deleteOccupantPermissions(gateway_id, occupant_id, company_id, occupant_email, source_IP)
        .catch(err => {
          throw err;
        })
    } else if (command == 4) {
      //Just call device provision api  and remove record from occupants permissions table for all gateway users
      await this.deleteOccupantPermissions(gateway_id, occupant_id, company_id, occupant_email, source_IP)
        .catch(err => {
          throw err;
        })
      //delete gateway alert configs
      await this.deleteAlertCommunicationConfigs(gateway_id,occupant_id,company_id,source_IP).catch(err => {
        throw err;
      })
      //update onetouch alert communication configs emails and phone number list to empty
      await this.updateOneTouchCommunicationConfigs(gateway_id,occupant_id,company_id,source_IP).catch(err => {
        throw err;
      })
    }
     else if (command == 2) {
      //update the shadow of devices
      const devices = await database.devices.findAll({
        where: { gateway_id },
      });
      var promiseList = []
      var itemIds = []
      itemIds.push(gateway_id)
      let nameCount = 0;
      for (const [index, device] of devices.entries()) {
        let emptyDeviceName = "{\"deviceName\":\"\",\"ShortID_d\":0}";
        if (code == 'purmo') {
          if (device.type == 'coordinator_device') {
            emptyDeviceName = "{\"deviceName\":\"\",\"ShortID_d\":0}";
          } else {
            emptyDeviceName = "{\"deviceName\":\" Unisenza Plus " + (nameCount + 1) + "\",\"ShortID_d\":0}";
            nameCount++;
          }
        }
        itemIds.push(device.id);
        if (device.type == 'coordinator_device') {
          let publishData = [
            {
              Name: `ep0${propertyAppDataC}`,
              Value: emptyAppDataC
            }, {
              Name: `ep0${propertyDeviceName}`,
              Value: emptyDeviceName
            }
          ]
          promiseList.push(await this.publishDeviceNameArray(company_id, device.device_code, publishData));
        } else {
          promiseList.push(await this.publishDeviceName(company_id, device.device_code, propertyDeviceName, emptyDeviceName));
        }
      }

      await Promise.all(promiseList).then((results) => {
        return results
      }).catch(error => {
        const err = ErrorCodes['800022'];
        throw err;
      });
      //delete dashboard attributes of the devices,gateway
      await this.deleteDashboardAttributes(itemIds, company_id).catch(err => {
        throw err;
      });
      //delete the groups connected on the gateway
      await this.deleteGatewayOccupantGroups(gateway_id, occupant_id, company_id, source_IP)
        .catch(err => {
          throw err;
        })
      // Just call device provision api  and remove record from occupants permissions table for all gateway users
      await this.deleteOccupantPermissions(gateway_id, occupant_id, company_id, occupant_email, source_IP)
        .catch(err => {
          throw err;
        })
    } else if (command == 3) {
      //update the shadow of devices
      const devices = await database.devices.findAll({
        where: { gateway_id, type: 'coordinator_device' },
      });
      var promiseList = []
      var itemIds = []
      itemIds.push(gateway_id)
      for (const device of devices) {
        itemIds.push(device.id)
        promiseList.push(await this.publishDeviceName(company_id, device.device_code, propertyDeviceName, emptyDeviceName))
        promiseList.push(await this.publishDeviceName(company_id, device.device_code, propertyAppDataC, emptyAppDataC))
      }
      await Promise.all(promiseList).then((results) => {
        return results
      }).catch(error => {
        const err = ErrorCodes['800022'];
        throw err;
      });

      //factory reset the device
      const publishCommand = 'sGateway:SetFactoryReset_d'
      await this.factoryResetGateway(company_id, checkGatewayIdExists.device_code, publishCommand)
        .catch(err => {
          throw err;
        })
      await database.occupants_permissions.destroy(
        {
          where: {
            gateway_id
          }
        }
      ).catch((error) => {
        const err = ErrorCodes['160028'];
        throw err;
      });
    }
    var obj = {
      new: { command, gateway: checkGatewayIdExists },
      old: {}
    }
    for (const element of occupantsPermissions) {
      var notificationTokenLists = []
      const notificationToken = await this.getUserNotificationTokens(element.receiver_occupant_id)
        .catch((err) => {
          reject(err);
        });
      if (notificationToken && notificationToken.length > 0) {
        notificationTokenLists = lodash.map(notificationToken, 'token');
      }

      if (element.receiver_occupant_id == element.sharer_occupant_id) {
        var placeholdersData = {
          email: element.sharer_occupant.email,
          first_name: element.sharer_occupant.first_name,
          last_name: element.sharer_occupant.last_name,
          gateway_name: checkGatewayIdExists.name,
          gateway_code: checkGatewayIdExists.device_code,
          receiverList: [{
            email: element.sharer_occupant.email
          }],
          notificationTokenList: notificationTokenLists
        };
        ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.owner_unregistered_gateway,
          logObj, Entities.notes.event_name.deleted, company_id, company_id, null, occupant_id, placeholdersData, source_IP)
          .catch(err => {
          });
      } else {
        var placeholdersData = {
          email: element.receiver_occupant.email,
          first_name: element.receiver_occupant.first_name,
          last_name: element.receiver_occupant.last_name,
          gateway_name: checkGatewayIdExists.name,
          gateway_code: checkGatewayIdExists.device_code,
          receiverList: [{
            email: element.receiver_occupant.email
          }],
          notificationTokenList: notificationTokenLists
        };
        ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.gateway_unregistered,
          logObj, Entities.notes.event_name.deleted, company_id, company_id, null, occupant_id, placeholdersData).catch(err => {
          });
      }
    }
    ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.gateway_deleted,
      obj, Entities.notes.event_name.deleted, company_id, company_id, null, occupant_id, {}, source_IP).catch(err => {
      });
    return { message: "Gateway deleted with commmand " + command }
  }
  static async getUserNotificationTokens(occupantId) {
    await database.occupants_notification_tokens.findAll({
      where: {
        occupant_id: occupantId,
        [Op.or]: [
          {
            is_enable: {
              [Op.eq]: true
            }
          },
          {
            is_enable: {
              [Op.eq]: null
            }
          },
        ],
      }
    }).then(result => {
      return result
    }).catch((err) => {
      throw (err);
    });

  }

  static async unlinkGatewayLocation(req) {
    let Unlinked = null;
    let Linked = null;
    const { id } = req.params;
    let locationId = null;
    const before_location = req.body.location_id;
    let oldLocation = {};
    let get_connected_device = [];
    const gatewayDevice = await database.devices.findOne({ where: { id }, raw: true });
    // finding all connected devices to the gatewayId
    get_connected_device = await database.devices.findAll({
      where: { gateway_id: id },
      include: [
        {
          required: false,
          model: database.locations,
          as: 'locations',
          include: [
            {
              required: false,
              model: database.location_types,
              as: 'location_type',
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });

    const currentLocation = await LocationsService.getLocation(before_location);
    if (currentLocation.location_type.name !== 'site') {
      const { path } = currentLocation;
      for (const key of Object.keys(path)) {
        if (typeof path[key] === 'object' && path[key].hasOwnProperty('site')) {
          locationId = key;
          break;
        }
      }
    }
    // call to deviceProvision logic - start
    let adminData = await this.getAdminData(req.company_id);
    let role = currentLocation.location_type.name !== 'site' ? ROLES.site : null;
    let inputDetails = await this.getProvisionDetails(before_location, role, DPCommands.unshare, req.company_id);
    this.updateSharerListOnDeviceLocationUpdation(inputDetails, before_location, gatewayDevice.device_code, gatewayDevice.type,
      req.company_id, req.user_id, adminData, req.request_id);

    for (let d of get_connected_device) {
      if (d?.locations?.location_type?.name !== 'site') {
        role = ROLES.site;
        inputDetails = await this.getProvisionDetails(d?.locations?.id, role, DPCommands.unshare, req.company_id);
        this.updateSharerListOnDeviceLocationUpdation(inputDetails, d?.locations?.id, d.device_code, d.type,
          req.company_id, req.user_id, adminData, req.request_id);
      }
    }
    // call to deviceProvision logic - end

    const updateFields = {
      location_id: locationId, id, updated_by: req.user_id, updated_at: new Date(),
    };
    const queryStr = 'UPDATE devices SET location_id= :location_id,updated_by= :updated_by,updated_at= :updated_at where id = :id OR gateway_id = :id';
    const [results, metadata] = await database.sequelize.query(queryStr,
      {
        raw: true,
        replacements: updateFields,
        logging: console.log,
      });
    const updatedDeviceData = await database.devices.findOne({ where: { id } });
    const updatedLocation = await LocationsService.getLocation(updatedDeviceData.location_id);

    const unlink_obj = {
      old: gatewayDevice,
      new: {},
    };
    if (before_location && before_location != null) {
      Unlinked = Entities.locations.event_name.gateway_unlinked;
      ActivityLogs.addActivityLog(Entities.locations.entity_name, Unlinked,
        unlink_obj, Entities.notes.event_name.updated, currentLocation.id, req.company_id, req.user_id, null, null, req.source_IP);
    }
    if (before_location) {
      oldLocation = currentLocation;
    } else {
      oldLocation = {};
    }
    const link_obj = {
      old: {},
      new: updatedDeviceData,
    };
    if (locationId && JSON.stringify(locationId) != JSON.stringify(before_location)) {
      Linked = Entities.locations.event_name.gateway_linked;
      ActivityLogs.addActivityLog(Entities.locations.entity_name, Linked,
        link_obj, Entities.notes.event_name.updated, locationId, req.company_id, req.user_id, null, null, req.source_IP);
    }
    const device_obj = {
      old: oldLocation,
      new: updatedLocation,
    };
    // link and unlink all the gateway connected devices //unlink activitylog for all devices
    get_connected_device.forEach(async (element) => {
      const unlink_gateways_location_obj = {
        old: element,
        new: {},
      };
      if (before_location && JSON.stringify(locationId) != JSON.stringify(before_location)) {
        Unlinked = Entities.locations.event_name.device_unlinked;
        ActivityLogs.addActivityLog(Entities.locations.entity_name, Unlinked,
          unlink_gateways_location_obj, Entities.notes.event_name.updated, before_location, req.company_id, req.user_id, null, null, req.source_IP);
      }
      const new_connected_gateways_devices = await database.devices.findOne({
        where: {
          id: element.id,
        },
        raw: true,
      });
      const link_gateways_location_obj = {
        old: {},
        new: new_connected_gateways_devices,
      };
      if (locationId && JSON.stringify(locationId) != JSON.stringify(before_location)) {
        Linked = Entities.locations.event_name.device_linked;
        ActivityLogs.addActivityLog(Entities.locations.entity_name, Linked,
          link_gateways_location_obj, Entities.notes.event_name.updated, locationId, req.company_id, req.user_id, null, null, req.source_IP);
      }
      if (locationId && JSON.stringify(locationId) != JSON.stringify(before_location)) {
        ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.locations.event_name.updated,
          device_obj, Entities.notes.event_name.updated, new_connected_gateways_devices.id, req.company_id, req.user_id, null, null, req.source_IP);
      }
    }); // finished foreach loop
    if (JSON.stringify(updatedDeviceData.location_id) != JSON.stringify(before_location)) {

      ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.locations.event_name.updated,
        device_obj, Entities.notes.event_name.updated, updatedDeviceData.id, req.company_id, req.user_id, null, null, req.source_IP);
    }
    // new implementation for occupant_checkin permission removal
    // check if current location type is "room" or not
    let locationTypeName = currentLocation.location_type.name;
    // get the list of occupants who are checked in to this location
    if (locationTypeName === 'room') {
      const occupantsCheckinList = await database.occupants_locations.findAll({
        include: [
          {
            model: database.occupants,
            required: true,
          },
        ],
        where: {
          location_id: currentLocation.id, status: 'checked in',
        },
      });
      // find all the devices assigned to room location
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;
      const AdminData = await userService.cognitoLogin(req, email, password);
      let occupant_id = null;
      let occupant_email = null;
      const identity_id = AdminData.identityId;
      const accessToken = AdminData.accessToken;
      // call to device provision api to give access to occupants checkins
      // if occupants are assigned to the location only then enter for loop
      if (occupantsCheckinList.length > 0) {
        for (let item in occupantsCheckinList) {
          const element = occupantsCheckinList[item];
          if (element.occupant.id != null) {
            occupant_id = element.occupant.id;
            occupant_email = element.occupant.email;
            for (let ele in get_connected_device) {
              const deviceData = get_connected_device[ele];
              const headerParams = {
                Authorization: accessToken,
              };
              const deviceFormObj = {
                UserID: identity_id,
                Username: occupant_email,
                Command: DPCommands.unshare,
                DeviceID: deviceData.device_code,
              };
              deviceFormObj.occupantId = occupant_id;
              await DeviceProvisionService.deviceProvison(headerParams, deviceFormObj, deviceFormObj.Command)
                .then((result) => {
                  const { data } = result;
                  ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.location_access_removed,
                    deviceFormObj, Entities.notes.event_name.location_access_unshared_success, req.company_id, req.company_id, req.user_id, occupant_id, null, req.source_IP);
                  if (data.errorMessage) {
                    ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.location_access_not_removed,
                      deviceFormObj, Entities.notes.event_name.location_access_unshared_failed, req.company_id, req.company_id, req.user_id, occupant_id, null, req.source_IP);
                  } else if (data.statusCode != 200) {
                    deviceFormObj.occupantId = occupant_id;
                    ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.location_access_not_removed,
                      deviceFormObj, Entities.notes.event_name.location_access_unshared_failed, req.company_id, req.company_id, req.user_id, occupant_id, null, req.source_IP);
                  }
                })
                .catch((error) => {
                  ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.location_access_not_removed,
                    deviceFormObj, Entities.notes.event_name.location_access_unshared_failed, req.company_id, req.company_id, req.user_id, occupant_id, null, req.source_IP);
                })
            }
          }
        }
      }
    }
    return metadata.rowCount;
  }

  static async linkGatewayLocation(req, ids) {
    const locationId = req.body.location_id;
    let check_location_id;
    let getLocationData;
    let Unlinked = null;
    let Linked = null;
    let unlinked_obj = {};
    let linked_obj = {};
    let oldObj = {};
    let gateways;
    let is_gateway_type = null;

    let check_gateways = [];
    check_gateways = await database.devices.findAll({
      where: {
        id: [...ids],
      },
      raw: true,
    });
    // call to deviceProvision logic
    let adminData = await this.getAdminData(req.company_id)
    let inputDetails = await this.getProvisionDetails(locationId, null, DPCommands.share, req.company_id);
    for (let gateway of check_gateways) {
      this.updateSharerListOnDeviceLocationUpdation(inputDetails, locationId, gateway.device_code,
        gateway.type, req?.company_id, req?.user_id, adminData, req.request_id);
    }

    const currentLocation = await LocationsService.getLocation(locationId);
    if (!currentLocation) {
      Logger.error(`location not found with id  ${locationId}`);
      throw Error(JSON.stringify({ error: '150003' }));
    }
    const updateFields = {
      location_id: locationId, ids, updated_by: req.user_id, updated_at: new Date(),
    };
    const queryStr = 'UPDATE devices SET location_id= :location_id,updated_by= :updated_by,updated_at= :updated_at where id in (:ids) OR gateway_id in (:ids)';
    const [results, metadata] = await database.sequelize.query(queryStr,
      {
        raw: true,
        replacements: updateFields,
        logging: console.log,
      });
    // earlier location unlink activity log adding
    check_gateways.forEach(async (attributes) => {
      let gateways_devices = [];
      let device_type = attributes.type;

      //if type is gateway then find its all connected devices.
      if (device_type == 'gateway') {
        is_gateway_type = true;
        // finding all connected gateways devices and unlinking them
        gateways_devices = await database.devices.findAll({
          where: {
            gateway_id: attributes.id,
          },
          raw: true,
        });
      }
      check_location_id = attributes.location_id;
      getLocationData = await LocationsService.getLocation(check_location_id);
      unlinked_obj = {
        old: attributes,
        new: {},
      };

      if (check_location_id && JSON.stringify(locationId) != JSON.stringify(check_location_id)) {
        if (device_type == 'gateway') {
          Unlinked = Entities.locations.event_name.gateway_unlinked;
        } else {
          Unlinked = Entities.locations.event_name.device_unlinked;
        }
        ActivityLogs.addActivityLog(Entities.locations.entity_name, Unlinked,
          unlinked_obj, Entities.notes.event_name.updated, check_location_id, req.company_id, req.user_id, null, null, req.source_IP);
      }

      const gateway_id = attributes.id; // checking location id after update
      gateways = await database.devices.findOne({
        where: {
          id: gateway_id,
        },
        raw: true,
      });
      if (check_location_id) {
        oldObj = getLocationData;
      } else {
        oldObj = {};
      }
      linked_obj = {
        old: {},
        new: gateways,
      };
      if (JSON.stringify(check_location_id) != JSON.stringify(locationId)) {
        if (device_type == 'gateway') {
          Linked = Entities.locations.event_name.gateway_linked;
        } else {
          Linked = Entities.locations.event_name.device_linked;
        }
        ActivityLogs.addActivityLog(Entities.locations.entity_name, Linked,
          linked_obj, Entities.notes.event_name.updated, locationId, req.company_id, req.user_id, null, null, req.source_IP);
      }
      const device_obj = {
        old: oldObj,
        new: currentLocation,
      };

      if (is_gateway_type == true) { // unlink activitylog for all devices
        gateways_devices.forEach(async (value) => {
          const unlink_gateways_location_obj = {
            old: value,
            new: {},
          };
          if (check_location_id && JSON.stringify(locationId) != JSON.stringify(check_location_id)) {
            Unlinked = Entities.locations.event_name.device_unlinked;
            ActivityLogs.addActivityLog(Entities.locations.entity_name, Unlinked,
              unlink_gateways_location_obj, Entities.notes.event_name.updated, check_location_id, req.company_id, req.user_id, null, null, req.source_IP);
          }
          const new_connected_gateways_devices = await database.devices.findOne({
            where: {
              id: value.id,
            },
            raw: true,
          });
          const link_gateways_location_obj = {
            old: {},
            new: new_connected_gateways_devices,
          };
          if (JSON.stringify(locationId) != JSON.stringify(check_location_id)) {
            Linked = Entities.locations.event_name.device_linked;
            ActivityLogs.addActivityLog(Entities.locations.entity_name, Linked,
              link_gateways_location_obj, Entities.notes.event_name.updated, locationId, req.company_id, req.user_id, null, null, req.source_IP);
          }
          if (JSON.stringify(locationId) != JSON.stringify(check_location_id)) {
            ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.locations.event_name.updated,
              device_obj, Entities.notes.event_name.updated, new_connected_gateways_devices.id, req.company_id, req.user_id, null, null, req.source_IP);
          }
        });
        let locationTypeName = currentLocation.location_type.name;
        // get the list of occupants who are checked in to this location
        // if (locationTypeName === 'room') {
        //   await this.linkDevicesToTheOccupants(req, locationId, gateways_devices)
        //     .catch((error) => {
        //       Logger.error(`error while linking the devices to the occupants  ${error}`);
        //     })
        // }

      }
      //deviding whether gateway or device
      // if (device_type == 'gateway') {
      //   is_gateway_type = true;
      //   event = Entities.devices.event_name.link_gateway_location;
      // } else {
      //   is_gateway_type = false;
      //   event = Entities.devices.event_name.link_device_location;
      // }

      if (JSON.stringify(check_location_id) != JSON.stringify(locationId)) {
        ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.locations.event_name.updated,
          device_obj, Entities.notes.event_name.updated, gateways.id, req.company_id, req.user_id, null, null, req.source_IP);
      }
    });

    // new implementation for occupant_checkin permission
    // check if current location type is "room" or not
    let locationTypeName = currentLocation.location_type.name;
    if (locationTypeName === 'room') {
      // satrted job for linking device to the occupants.
      const createdBy = req.user_id;
      const updatedBy = req.user_id;
      let input = {
        ids,
        locationId,
        accessToken: adminData.accessToken,
        adminIdentityId: adminData.identityId,
      }
      await jobsService.createJob('linkDevicesToTheOccupants', input, req.company_id, createdBy, updatedBy, null, req.request_id)
        .then(async (resp) => resp)
        .catch((err) => {
          throw (err);
        });
    }
    //return at the end
    return gateways;
  }

  static async linkDevicesToTheOccupants(req, locationId, gateways_devices) {
    const occupantsCheckinList = await database.occupants_locations.findAll({
      include: [
        {
          model: database.occupants,
          required: true,
        },
      ],
      where: {
        location_id: locationId, status: 'checked in',
      },
    });
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const AdminData = await userService.cognitoLogin(req, email, password);
    let occupant_id = null;
    let occupant_email = null;
    const identity_id = AdminData.identityId;
    const accessToken = AdminData.accessToken;
    // call to device provision api to give access to occupants checkins
    // if occupants are assigned to the location only then enter for loop
    if (occupantsCheckinList.length > 0) {
      for (let item in occupantsCheckinList) {
        const element = occupantsCheckinList[item];
        if (element.occupant.id != null) {
          occupant_id = element.occupant.id;
          occupant_email = element.occupant.email;
          for (let ele in gateways_devices) {
            const deviceData = gateways_devices[ele];
            const headerParams = {
              Authorization: accessToken,
            };
            let deviceCode = deviceData.device_code.split('-')
            if (deviceCode.length > 2) {
              const deviceFormObj = {
                UserID: identity_id,
                Username: occupant_email,
                Command: DPCommands.share,
                DeviceID: deviceData.device_code,
              };
              deviceFormObj.occupantId = occupant_id;
              await DeviceProvisionService.deviceProvison(headerParams, deviceFormObj, deviceFormObj.Command)
                .then((result) => {
                  const { data } = result;
                  ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.location_access_shared,
                    deviceFormObj, Entities.notes.event_name.location_access_success, req.company_id, req.company_id, req.user_id, occupant_id, null, req.source_IP);
                  if (data.errorMessage) {
                    ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.location_access_unshared,
                      deviceFormObj, Entities.notes.event_name.location_access_failed, req.company_id, req.company_id, req.user_id, occupant_id, null, req.source_IP);
                  } else if (data.statusCode != 200) {
                    deviceFormObj.occupantId = occupant_id;
                    ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.location_access_unshared,
                      deviceFormObj, Entities.notes.event_name.location_access_failed, req.company_id, req.company_id, req.user_id, occupant_id, null, req.source_IP);
                  }
                })
                .catch((error) => {
                  ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.location_access_unshared,
                    deviceFormObj, Entities.notes.event_name.location_access_failed, req.company_id, req.company_id, req.user_id, occupant_id, null, req.source_IP);
                })
            }
          }
        }
      }
    }
    return null;
  }

  static async getParentLocationsDevices(req) {
    const companyId = req.body.company_id;
    const userId = req.user_id;
    const locationId = req.params.id;
    let query = { ...req.query };
    // getting list of locations assigned to user
    let userLocations = await database.locations_permissions.findAll({
      attributes: ['location_id'],
      where: {
        company_id: companyId,
        user_id: userId,
      },
      raw: true,
    });
    userLocations = lodash.map(userLocations, (ele) => ele.location_id);
    // getting location info to which device will get link
    const currentLocation = await LocationsService.getLocation(locationId);
    if (!currentLocation) {
      Logger.error(`location not found with id  ${locationId}`);
      throw Error(JSON.stringify({ error: '150003' }));
    }
    let ids = [];
    let includesArr = [];
    if (await checkAllDeviceAccess({ companyId, userId })) {
      ids = Object.keys(currentLocation.path)
        .map((key) => {
          if (key !== 'breadcrumb') {
            return key;
          }
        }).filter((item) => item);
    } else {
      if (currentLocation.location_type.name === 'site') {
        throw Error(JSON.stringify({ error: '170004' }));
      }
      ids = Object.keys(currentLocation.path)
        .map((key) => { // check if user has access to parent locations of current location
          if (key !== 'breadcrumb' && userLocations.includes(key)) {
            return key;
          }
        }).filter((item) => item);
    }
    query.company_id = companyId;
    if (currentLocation.location_type.name === 'site') {
      query = {
        ...query,
        location_id: {
          [Op.eq]: null,
        },
      };
    } else {
      query.location_id = ids.filter((e) => e != locationId);
      includesArr = [...includesArr,
      {
        model: database.locations,
        required: true,
        as: 'locations',
      },
      ];
    }
    if (!query.type) {
      query = {
        ...query,
        [Op.or]: [
          { type: { [Op.not]: 'gateway' } },
          { type: null },
        ],
      };
    }
    const devices = await database.devices.findAll({
      where: query,
      include: includesArr,
      raw: true,
      nest: true,
    });
    return devices;
  }

  static async getSecondaryLocations(req) {
    const { id } = req.params;
    const device = await database.devices.findOne({
      where: { id },
      include: [
        {
          model: database.devices,
          required: false,
          as: 'gateway',
          include: [{
            model: database.locations,
            required: false,
            as: 'locations',
          }],
        },
      ],
      raw: true,
      nest: true,
    });
    let locations = null;
    if (device.gateway_id && device.gateway && device.gateway.location_id) {
      const queryStr = 'select id from locations where path ? :locationId';
      let ids = await database.sequelize.query(queryStr,
        {
          raw: true,
          replacements: { locationId: device.gateway.location_id },
          logging: console.log,
          type: QueryTypes.SELECT,
        });
      ids = lodash.map(ids, (ele) => ele.id);
      locations = await database.locations.findAll({
        include: [
          {
            model: database.location_types,
            required: true,
          },
        ],
        where: {
          id: ids,
        },
        raw: true,
        nest: true,
      });
    } else {
      const userDetail = {};
      userDetail.query = {};
      userDetail.query.user_id = req.user_id;
      locations = await AccessPermissionService.getAllLocationsOfUser(userDetail);
      locations = locations.filter((x) => x !== null);
    }
    return locations;
  }

  // static async getAlertTypeToInclude(type) {
  //   const alertTypes = await database.rules.findAll({
  //     attributes: ['alert_type'],
  //     where: {
  //       type,
  //     },
  //   });
  //   const list = [];
  //   if (alertTypes.length > 0) {
  //     alertTypes.forEach((element) => {
  //       list.push(element.alert_type);
  //     });
  //   }
  //   return list;
  // }

  static async getLocaleFromTimeZone(timeZone) {
    const dateTimeFormat = new Intl.DateTimeFormat([], { timeZone });
    const { locale } = dateTimeFormat.resolvedOptions();
    return locale;
  }

  static async getHistory(device_code, property_name, property_value,
    start_date, end_date, type, raw_data, page, limit, order, company_id) {
    // declare finalList for output data
    let finalList = [];
    // check whether device exists or not
    const devicesData = await database.devices.findOne({ where: { device_code } }).catch((error) => {
      console.log("🚀  file: DevicesService.js:3144  DevicesService ~ error:", error)
      const err = ErrorCodes['800019'];
      throw err;
    });
    if (!devicesData) {
      const err = ErrorCodes['800019'];
      throw err;
    }

    // get gateway code from device code
    var deviceCodeSplitArray = device_code.split('-');
    const gateway_code = deviceCodeSplitArray[0] + "-" + deviceCodeSplitArray[1];
    const deviceCreatedAt = devicesData.registered_at || devicesData.created_at;
    // get the device shadow timezone property
    var params = {
      thingName: gateway_code, // required
    };
    const gateway = await database.devices.findOne({ where: { device_code: gateway_code } }).catch((error) => {
      const err = ErrorCodes['800019'];
      throw err;
    });
    if (!gateway) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    // const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
    // if (!shadowData) {
    //   const err = ErrorCodes['330005'];  // gateway shadow not updated
    //   throw err;
    // }
    let timeZone = gateway.timezone;
    let createdAt;
    if (!timeZone) {
      const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => data);
      if (!shadowData) {
        const err = ErrorCodes['330005'];  // gateway shadow not updated
        throw err;
      }
      var payload = JSON.parse(shadowData.payload);
      const { reported } = payload.state; // array
      if (!reported) {
        return { success: false };
      }
      Object.keys(reported).forEach((key) => {
        if (reported[key].hasOwnProperty('properties')) {
          const { properties } = reported[key];
          if (Object.keys(properties).length > 0) {
            for (const key in properties) {
              if (key.includes(':TimeZone')) { // getting TimeZone value
                timeZone = properties[key];
                break; // Assuming you only want to retrieve the timezone
              }
            }
          }
        }
      });
      if (timeZone) {
        await database.devices.update({
          timezone: timeZone
        }, {
          where: {
            device_code: gateway_code
          }
        })
      } else {
        timeZone = 'Etc/UTC'
      }
    }
    // locale logic, get locale based on time zone
    const locale = await this.getLocaleFromTimeZone(timeZone);
    // time zone converting logic
    const eventTimestamp = new Date();
    let convertedTimestamp = eventTimestamp.toLocaleString(locale, {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // formatting converted date time into YYYY-MM-DDTHH:mm::ss.SSS[Z] format
    convertedTimestamp = moment(convertedTimestamp, 'M/DD/YYYY, h:mm:ss a').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    let time_zone_event_at = `(event_at AT TIME ZONE '${timeZone}')::timestamp with time zone AS time_zone_event_at`;

    // initialize sql queries
    let psqlQuery = "select id,device_code,model,property_name,event_at,property_display_name,value->>'old' as old_value ,value->>'new' as new_value, " + time_zone_event_at + " from device_events where event_at >= '" + deviceCreatedAt.toISOString() + "' and "
    let psqlCountQuery = "select count(*) from device_events where event_at >= '" + deviceCreatedAt.toISOString() + "' and "
    let whereCondition = " device_code = '" + device_code + "' and property_name = '" + property_name + "' "
    let rawPSQLQuery = "select id,device_code,model,property_name,event_at,property_display_name,value->>'old' as old_value ,value->>'new' as new_value, " + time_zone_event_at + " from device_events where event_at >= '" + deviceCreatedAt.toISOString() + "' and "
    let rawWhereCondition = " device_code = '" + device_code + "' and property_name = '" + property_name + "' "

    //create query for filters based on availability
    //filter property_value
    if (property_value) {
      whereCondition = whereCondition + "and (value ->> 'new')::text =  '" + property_value + "' "
    }
    var defaultWhereCondition = whereCondition
    var openCloseWhereCondition = whereCondition
    var openCloseDefaultWhereCondition = whereCondition
    //filter date range
    if (start_date && end_date) {
      whereCondition = whereCondition + "and event_at between '" + start_date + "' and '" + end_date + "' "
    }
    else if (start_date) {
      whereCondition = whereCondition + "and event_at > '" + start_date + "' "
    }
    else if (end_date) {
      whereCondition = whereCondition + "and event_at < '" + end_date + "' "
    }
    if (start_date) {
      defaultWhereCondition = defaultWhereCondition + "and event_at <= '" + start_date + "' "
    }
    if (end_date) {
      openCloseWhereCondition = openCloseWhereCondition + "and (value ->> 'new')::text = '0' "
    }
    // finalising rawwhere condition
    rawWhereCondition = whereCondition

    //check raw data
    if (raw_data == false || raw_data == 'false') {
      whereCondition = whereCondition + " and value ->> 'new' != value ->> 'old' "
    }

    let openClosePSQLQuery = psqlQuery
    let rawDefaultPSQLQuery = psqlQuery
    psqlQuery = psqlQuery + whereCondition
    var defaultPSQLQuery = rawPSQLQuery + defaultWhereCondition
    rawPSQLQuery = rawPSQLQuery + rawWhereCondition
    psqlCountQuery = psqlCountQuery + whereCondition
    //add group by and order by
    if (order && order == 'desc' && type == 'Normal') {
      psqlQuery = psqlQuery + " order by event_at desc,parsed_at desc"
      rawPSQLQuery = rawPSQLQuery + " order by event_at desc,parsed_at desc limit 1 "
      defaultPSQLQuery = defaultPSQLQuery + " order by event_at desc,parsed_at desc limit 1 "
    } else {
      psqlQuery = psqlQuery + " order by event_at asc,parsed_at asc"
      rawPSQLQuery = rawPSQLQuery + " order by event_at asc,parsed_at asc limit 1 "
      defaultPSQLQuery = defaultPSQLQuery + " order by event_at desc,parsed_at desc limit 1 "
    }

    //add limit, offset
    let categoryb_enabled = process.env.CATEGORYB_ENABLED;
    let databaseName = database
    if ((categoryb_enabled == true || categoryb_enabled == 'true')) {
      databaseName = categoryb_database
    }
    var offset = page * limit;
    psqlQuery = psqlQuery + " limit " + limit + " offset " + offset + " "
    let dataList = await databaseName.sequelize.query(psqlQuery,
      {
        raw: true
      });

    let countDataList = await databaseName.sequelize.query(psqlCountQuery,
      {
        raw: true
      });

    let firstRecordDataList = await databaseName.sequelize.query(rawPSQLQuery,
      {
        raw: true
      });

    let defaultDataList = await databaseName.sequelize.query(defaultPSQLQuery,
      {
        raw: true
      });
    //if datalist is empty and not raw data
    if (dataList && dataList[1].rowCount < 1 && (raw_data == false || raw_data == 'false')) {
      dataList = firstRecordDataList
    }
    // if type is normal,by default we add first record of that time duration, if raw_data is false
    else if ((raw_data == false || raw_data == 'false') && type == 'Normal') {
      if (dataList && firstRecordDataList && dataList[1].rows[0]["new_value"] != firstRecordDataList[1].rows[0]["new_value"]) {
        dataList[1].rows.unshift(firstRecordDataList[1].rows[0])
      }
    }

    let total_count_output = countDataList[0];
    total_count_output = (total_count_output[0] && total_count_output[0].count) ? total_count_output[0].count : dataList.length; // doubt need to take dataList[1].rows.length


    if (dataList[1].rows.length < 1 && (type == 'Normal' || type == 'OpenClose')) {
      if (defaultDataList && defaultDataList[1].rows.length > 0) {
        let timezone_start_date = this.convertToTimezone(start_date, timeZone)
        defaultDataList[1].rows[0]["event_at"] = start_date
        defaultDataList[1].rows[0]["time_zone_event_at"] = timezone_start_date
        dataList = defaultDataList
      }
    }
    //formatting based on type code we need to write here

    finalList = [...dataList[1].rows];

    var openCloseList = [];
    if (type == "OpenClose" && (raw_data == false || raw_data == 'false')) {
      // total_count_output = Math.round(total_count_output / 2);
      var elementList = []
      for (let index = 0; index < dataList[1].rows.length; index++) {
        let element = {}
        //check is there any apposite event present than first event if present by default add the first place
        if (index == 0 && dataList[1].rows[index]["new_value"] == 0 && page == 0) {
          let openCloseDefaultWhere = openCloseDefaultWhereCondition + "and (value ->> 'new')::text = '1' " + "and event_at > '" + start_date + "' "
          let openCloseDefaultPSQLQuery = openClosePSQLQuery + openCloseDefaultWhere + " order by event_at asc limit 1 "
          let openCloseRecordDataList = await databaseName.sequelize.query(openCloseDefaultPSQLQuery,
            {
              raw: true
            });
          if (openCloseRecordDataList && openCloseRecordDataList[0].length > 0) {
            element["open"] = moment(openCloseRecordDataList[0][0]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
            element["close"] = moment(dataList[1].rows[index]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
            if (!finalList.includes(openCloseRecordDataList[0][0])) {
              if (finalList.length > 0 && moment(finalList[0]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS') > moment(openCloseRecordDataList[0][0]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')) {
                finalList.unshift(openCloseRecordDataList[0][0])
              }
            }
            if (!elementList.includes(element)) {
              elementList.push(element)
            }
          } else {
            element["open"] = moment(dataList[1].rows[index]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
            element["close"] = moment(dataList[1].rows[index]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
            if (!elementList.includes(element)) {
              elementList.push(element)
            }
          }
        }
        if (index == 0 && dataList[1].rows[index]["new_value"] == 1 && page == 0) {
          let openCloseDefaultWhere = openCloseDefaultWhereCondition + "and (value ->> 'new')::text = '0' " + "and event_at > '" + start_date  + "' and event_at <= '" + end_date + "'"
          let openCloseDefaultPSQLQuery = openClosePSQLQuery + openCloseDefaultWhere + " order by event_at asc limit 1 "
          let openCloseRecordDataList = await databaseName.sequelize.query(openCloseDefaultPSQLQuery,
            {
              raw: true
            });
          if (openCloseRecordDataList && openCloseRecordDataList[0].length > 0) {
            element["open"] = moment(dataList[1].rows[index]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
            element["close"] = moment(openCloseRecordDataList[0][0]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
            if (!finalList.includes(openCloseRecordDataList[0][0])) {
              if (finalList.length > 0 && moment(finalList[0]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS') > moment(openCloseRecordDataList[0][0]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')) {
                finalList.unshift(openCloseRecordDataList[0][0])
              }
            }
            if (!elementList.includes(element)) {
              elementList.push(element)
            }
          } else {
            // element["open"] = moment(dataList[1].rows[index]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
            // element["close"] = moment(dataList[1].rows[index]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
            // elementList.push(element)
          }
        }
        let defaultElement = {}
        let isDefaultClose = false
        let defaultCloseElement = {}
        let timezone_end_date = this.convertToTimezone(end_date, timeZone)
        let timezone_start_date = this.convertToTimezone(start_date, timeZone)
        let timezone_current_date = this.convertToTimezone(new Date(),timeZone)
        if (index == 0 && dataList[1].rows[index]["new_value"] == 0 && page == 0) {
          // element["open"] = moment(dataList[1].rows[index]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
          // element["close"] = moment(dataList[1].rows[index]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
          // elementList.push(element)
          // total_count_output = total_count_output + 1
        } else {
          if (dataList[1].rows[index]["new_value"] == 1) {
            if(typeof dataList[1].rows[index]["event_at"] != 'string'){
              defaultElement["open"] = momentTimezone(dataList[1].rows[index]["event_at"]).tz(timeZone).format('YYYY-MM-DD HH:mm:ss.SSS')
            }else{
              if(!dataList[1].rows[index]["event_at"].includes('Z')){
                defaultElement["open"] = momentTimezone(dataList[1].rows[index]["event_at"]+"Z").tz(timeZone).format('YYYY-MM-DD HH:mm:ss.SSS')
              }else{
                defaultElement["open"] = momentTimezone(dataList[1].rows[index]["event_at"]).tz(timeZone).format('YYYY-MM-DD HH:mm:ss.SSS')
              }
            }
            if ((index + 1 < dataList[1].rows.length) || (((parseInt(page) + 1) * limit) < parseInt(total_count_output))) {
              if ((index != dataList[1].rows.length - 1)) {
                defaultElement["close"] = moment(dataList[1].rows[index + 1]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
                if ((index + 1 == dataList[1].rows.length - 1) && moment(dataList[1].rows[index + 1]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS') < moment(end_date).utc().format('YYYY-MM-DD HH:mm:ss.SSS')) {
                  isDefaultClose = true
                  if (timezone_current_date > timezone_end_date) {
                    defaultCloseElement["open"] = moment(timezone_end_date).format('YYYY-MM-DD HH:mm:ss.SSS')
                    defaultCloseElement["close"] = moment(timezone_end_date).format('YYYY-MM-DD HH:mm:ss.SSS')
                  } else {
                    defaultCloseElement["close"] = moment(timezone_current_date).format('YYYY-MM-DD HH:mm:ss.SSS')
                    defaultCloseElement["open"] = moment(timezone_current_date).format('YYYY-MM-DD HH:mm:ss.SSS')
                  }
                }
                // defaultElement["close"] = moment(dataList[1].rows[index + 1]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
              } else {
                openCloseWhereCondition = openCloseWhereCondition + "and  event_at >= '" + dataList[1].rows[index]["event_at"].toISOString() + "' "
                openClosePSQLQuery = openClosePSQLQuery + openCloseWhereCondition + " order by event_at asc limit 1 "
                let openCloseRecordDataList = await databaseName.sequelize.query(openClosePSQLQuery,
                  {
                    raw: true
                  });
                if (openCloseRecordDataList && openCloseRecordDataList[1].rows.length > 0) {
                  defaultElement["close"] = moment(openCloseRecordDataList[1].rows[0]["time_zone_event_at"]).utc().format('YYYY-MM-DD HH:mm:ss.SSS')
                }
              }
            } else {
              if (timezone_current_date > timezone_end_date) {
                defaultElement["close"] = moment(timezone_end_date).format('YYYY-MM-DD HH:mm:ss.SSS')
              } else {
                defaultElement["close"] = moment(timezone_current_date).format('YYYY-MM-DD HH:mm:ss.SSS')
              }
            }
            if (!elementList.includes(defaultElement)) {
              elementList.push(defaultElement)
            }
            index++
          }
        }
        if (isDefaultClose === true) {
          elementList.push(defaultCloseElement)
        }
      }
      openCloseList = elementList
    }

    if (type == "RollerShutter" && (raw_data == false || raw_data == 'false')) {
      var elementList = [];
      for (var i = 0; i < dataList[1].rows.length; i++) {
        if (i == 0 || i == dataList[1].rows.length - 1) {
          elementList.push(dataList[1].rows[i]);
        } else {
          let preDataVal = parseInt(dataList[1].rows[i - 1].new_value);
          let currentDataVal = parseInt(dataList[1].rows[i].new_value);
          let nextDataVal = parseInt(dataList[1].rows[i + 1].new_value);
          let isPeak = (preDataVal < currentDataVal) && (currentDataVal > nextDataVal);
          let isValley = (preDataVal > currentDataVal) && (currentDataVal < nextDataVal);
          if (isPeak || isValley) {
            elementList.push(dataList[1].rows[i]);
          }
        }
      }
      // add here the % logic
      for (const ele of elementList) {
        ele.new_value = `${100 - ele.new_value}%`; // assigning % to new_value
      }
      finalList = elementList
    }


    if (total_count_output < finalList.length) {
      total_count_output = finalList.length
    }

    if (type == "OpenClose") {

      if (page == 0 && openCloseList.length > 0) {
        let newOpenCloseList = []
        let record = openCloseList[0]
        let openTime = record["open"]
        let closeTime = record["close"]
        let timezone_end_date = this.convertToTimezone(end_date, timeZone)
        let timezone_start_date = this.convertToTimezone(start_date, timeZone)
        let timezone_current_date = this.convertToTimezone(new Date(),timeZone)
         
        if (moment(openTime).format('YYYY-MM-DD HH:mm:ss.SSS') > moment(closeTime).format('YYYY-MM-DD HH:mm:ss.SSS')) {

          newOpenCloseList.push({
            "open": closeTime,
            "close": closeTime
          })
          let openCloseEndDate = timezone_current_date
          if (timezone_current_date > end_date) {
            openCloseEndDate = timezone_end_date
          }

          if (moment(openTime).format('YYYY-MM-DD HH:mm:ss.SSS') > moment(openCloseEndDate).format('YYYY-MM-DD HH:mm:ss.SSS')) {
            newOpenCloseList.push({
              "open": openCloseEndDate,
              "close": openCloseEndDate
            })
          } else {
            newOpenCloseList.push({
              "open": openTime,
              "close": openTime
            })
          }
          if(openCloseList.length>1){
            for (let index = 1; index < openCloseList.length; index++) {
              const element = openCloseList[index];
              newOpenCloseList.push(element)
            }
          }
        } else if ((moment(openTime).format('YYYY-MM-DD HH:mm:ss.SSS') == moment(closeTime).format('YYYY-MM-DD HH:mm:ss.SSS')) &&  openCloseList.length == 1) {
          let openCloseStartDate = start_date
          
          if (moment(closeTime).format('YYYY-MM-DD HH:mm:ss.SSS') <= moment(openCloseStartDate).format('YYYY-MM-DD HH:mm:ss.SSS')) {
            newOpenCloseList.push({
              "open": timezone_start_date,
              "close": timezone_start_date
            })
            let openCloseEndDate = timezone_current_date
            if (timezone_current_date > timezone_end_date) {
              openCloseEndDate = timezone_end_date
            }
            newOpenCloseList.push({
              "open": openCloseEndDate,
              "close": openCloseEndDate
            })
          }
          }
        if (newOpenCloseList.length > 0) {
          openCloseList = newOpenCloseList
        }

      }
      const uniqueArray = [];
      const seen = [];
      openCloseList.forEach(item => {
        const stringified = JSON.stringify(item);
        if (!seen.includes(stringified)) {
          seen.push(stringified);
          uniqueArray.push(item);
        }
      });
      return {
        total_count: parseInt(total_count_output),
        // with no order, offset group by
        count: finalList.length,
        // if data present dataList, if empty then limit 1 output
        records: finalList,
        // display records
        open_close_records: uniqueArray
      };
    } else {
      return {
        total_count: parseInt(total_count_output),
        // with no order, offset group by
        count: finalList.length,
        // if data present dataList, if empty then limit 1 output
        records: finalList,
        // display records
      };
    }

  }

  static async getKibanaHistory(device_code, property_name, property_value,
    start_date, end_date, page, limit, order, company_id) {
    // declare finalList for output data
    let finalList = [];
    let total_count = 0
    if (!limit) {
      limit = 1000
    }
    if (!page) {
      page = 0
    }
    if (order) {
      order = "asc"
    }
    // check whether device exists or not
    const devicesData = await database.devices.findOne({ where: { device_code } }).catch((error) => {
      console.log("🚀  file: DevicesService.js:3144  DevicesService ~ error:", error)
      const err = ErrorCodes['800019'];
      throw err;
    });
    if (!devicesData) {
      const err = ErrorCodes['800019'];
      throw err;
    }
    // get gateway code from device code
    var deviceCodeSplitArray = device_code.split('-');
    const gateway_code = deviceCodeSplitArray[0] + "-" + deviceCodeSplitArray[1];
    // get the device shadow timezone property
    const gateway = await database.devices.findOne({ where: { device_code: gateway_code } }).catch((error) => {
      const err = ErrorCodes['800019'];
      throw err;
    });
    if (!gateway) {
      const err = ErrorCodes['800013'];
      throw err;
    }

    let queryObj = {
      "sort": [
        {
          "parsedAt": {
            "order": order,
            "unmapped_type": "boolean"
          }
        }
      ],
      "from": page * limit,
      "size": limit,
      "_source": {
        "includes": [
          "topic_name",
          "parsedAt",
          "createdAt",
          "model",
          property_name
        ]
      },
      "query": {
        "bool": {
          "must": [],
          "filter": []
        }
      }
    }

    queryObj.query.bool.filter.push(
      {
        "match_all": {}
      }
    )
    queryObj.query.bool.filter.push(

      {
        "match_phrase": {
          "topic_name": device_code
        }
      }
    )
    if (property_name && property_value) {
      queryObj.query.bool.filter.push(
        {
          "match_phrase":
            { property_name: property_value }
        })
    } else if (property_name) {
      queryObj.query.bool.filter.push(
        {
          "exists": {
            "field": property_name
          }
        }
      )
    }
    queryObj.query.bool.filter.push(
      {
        "match_phrase": {
          "topic_name": device_code
        }
      })

    if (start_date && end_date) {
      queryObj.query.bool.filter.push({
        "range": {
          "parsedAt": {
            "gte": start_date,
            "lte": end_date,
            "format": "strict_date_optional_time"
          }
        }
      })
    }
    else if (start_date) {
      queryObj.query.bool.filter.push({
        "range": {
          "parsedAt": {
            "gte": start_date,
            "format": "strict_date_optional_time"
          }
        }
      })
    }
    else if (end_date) {
      queryObj.query.bool.filter.push({
        "range": {
          "parsedAt": {
            "lte": end_date,
            "format": "strict_date_optional_time"
          }
        }
      })
    }
    let username = process.env.KIBANA_USERNAME
    let password = process.env.KIBANA_PASSWORD
    let kibana_url = process.env.KIBANA_URL
    // 'https://search-dev-salus-k4gjwm7t5pkkd4uxq3oxrhl6ge.us-west-2.es.amazonaws.com/salusdev_aws_thing_accepted_new-*/_search'
    // 'https://search-saluseu-prod-wovb4ueoa6x5ndyirkxok2xx6q.eu-central-1.es.amazonaws.com/saluseu_prod_aws_thing_accepted_new-*/_search',

    let data = JSON.stringify(queryObj)
    try {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: kibana_url,
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: username,
          password: password
        },
        data: data
      };

      await axios.request(config)
        .then((response) => {
          if (response.data?.hits?.total?.value) {
            total_count = response.data.hits.total.value
          }
          if (response.data?.hits?.hits) {
            finalList = response.data.hits.hits.map(value => { return value._source })
          }
        })
        .catch((error) => {
          console.log("🚀 ~ DevicesService ~ error:", error)
          const err = ErrorCodes['280001'];
          throw err;
        });

    } catch (error) {
      console.log("🚀 ~ DevicesService ~ error:", error)
      const err = ErrorCodes['280001'];
      throw err;
    }
    return {
      total_count: total_count,
      // with no order, offset group by
      count: finalList.length,
      // if data present dataList, if empty then limit 1 output
      records: finalList,
      // display records
    };
  }

  static async getUserAnalytics(table_name, device_code, time_span, start_date, end_date, company_id) {
    // check whether device exists or not
    const devicesData = await database.devices.findOne({ where: { device_code } }).catch((error) => {
      const err = ErrorCodes['800019'];
      throw err;
    });
    if (!devicesData) {
      const err = ErrorCodes['800019'];
      throw err;
    }
    // get gateway code from device code
    var deviceCodeSplitArray = device_code.split('-');
    const gateway_code = deviceCodeSplitArray[0] + "-" + deviceCodeSplitArray[1];
    var params = {
      thingName: gateway_code, // required
    };
    const shadowData = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow').then((data) => {
      return data
    });
    if (!shadowData) {
      const err = ErrorCodes['330005'];  // gateway shadow not updated
      throw err;
    }
    let result = null;
    let finalResult = [];
    if (table_name == 'app_energymeter') {
      const query = `
        SELECT* FROM
        public.app_energymeter
        WHERE
        dsnid = :device_code
        AND timespan =:time_span
        AND time >= :start_date AND time < :end_date
        AND (
        (property::json->>:energy1) IS NOT NULL
        OR (property::json->>:energy2) IS NOT NULL
        OR (property::json->>:energy3) IS NOT NULL
        OR (property::json->>:energy4) IS NOT NULL)`;

      result = await database.sequelize.query(query, {
        raw: true,
        replacements: {
          device_code, time_span, start_date, end_date,
          energy1: 'ep1:sMeterS:sumEnergy_kWh',
          energy2: 'ep2:sMeterS:sumEnergy_kWh',
          energy3: 'ep3:sMeterS:sumEnergy_kWh',
          energy4: 'ep4:sMeterS:sumEnergy_kWh'
        },
        nest: true,
        type: QueryTypes.SELECT,
      }).catch((error) => {
        Logger.error(`getapp_energymeter error :  ${error}`);
        throw error;
      })

      if (result) {
        for (let i = 0; i < result.length; i++) {
          let data = result[i]
          let energy1 = null
          let energy2 = null
          let energy3 = null
          let energy4 = null
          if (data.property) {
            let property = JSON.parse(data.property)
            if (property.hasOwnProperty("ep1:sMeterS:sumEnergy_kWh")) {
              energy1 = property["ep1:sMeterS:sumEnergy_kWh"]
            } else if (property.hasOwnProperty("ep2:sMeterS:sumEnergy_kWh")) {
              energy2 = property["ep2:sMeterS:sumEnergy_kWh"]
            } else if (property.hasOwnProperty("ep3:sMeterS:sumEnergy_kWh")) {
              energy3 = property["ep3:sMeterS:sumEnergy_kWh"]
            } else if (property.hasOwnProperty("ep4:sMeterS:sumEnergy_kWh")) {
              energy4 = property["ep4:sMeterS:sumEnergy_kWh"]
            }
          }
          data.energy1 = energy1;
          data.energy2 = energy2;
          data.energy3 = energy3;
          data.energy4 = energy4;
          finalResult.push(data);
        }
      }
    } else if (table_name == 'app_smartplug') {
      const query = `
          SELECT* FROM
          public.app_smartplug
          WHERE
          dsnid = :device_code
          AND timespan =:time_span
          AND time >= :start_date AND time < :end_date
		      AND (property::json->> :energy) IS NOT NULL;`;

      result = await database.sequelize.query(query, {
        raw: true,
        replacements: {
          device_code, time_span, start_date, end_date,
          energy: 'ep9:sMeterS:sumEnergy_kWh'
        },
        nest: true,
        type: QueryTypes.SELECT,
      }).catch((error) => {
        Logger.error(`getapp_smartplug error :  ${error}`);
        throw error;
      })

      if (result) {
        for (let i = 0; i < result.length; i++) {
          let data = result[i]
          let energy = null
          if (data.property) {
            let property = JSON.parse(data.property)
            if (property.hasOwnProperty("ep9:sMeterS:sumEnergy_kWh")) {
              energy = property["ep9:sMeterS:sumEnergy_kWh"]
            }
          }
          data.energy = energy;
          finalResult.push(data);
        }
      }
    }
    return finalResult;
  }

  static async getDeviceShadows(device_codes, occupant_id, company_id, identity_id) {

    if (!device_codes) {
      device_codes = []
    }
    let notFoundList = []
    let errorList = []
    let successList = []
    let dontHavePermissions = []
    const permissions = await database.occupants_permissions.findAll({ where: { receiver_occupant_id: occupant_id } })
      .catch((error) => {
        const err = ErrorCodes['490003'];
        throw err;
      });
    let gatewaysWithPermissions = lodash.map(permissions, (element) => { return element.gateway_id })
    const devicesData = await database.devices.findAll({
      where: {
        device_code: {
          [Op.in]: device_codes
        }
      }
    }).catch((error) => {
      const err = ErrorCodes['800019'];
      throw err;
    });

    let deviceCodeList = lodash.map(devicesData, (element => { return element.device_code }))
    device_codes.forEach(element => {
      if (!deviceCodeList.includes(element)) {
        notFoundList.push(element)
      }
    })
    let finalDeviceCodes = []
    const sharedDeviceList = await OccupantService.sharedDeviceList(identity_id);
    devicesData.forEach(element => {
      if (gatewaysWithPermissions.includes(element.id) || gatewaysWithPermissions.includes(element.gateway_id)) {
        finalDeviceCodes.push(element)
      }
      else if (sharedDeviceList.includes(element.device_code)) {
        finalDeviceCodes.push(element)
      }
    })
    let finalDeviceCodeList = lodash.map(finalDeviceCodes, (element => { return element.device_code }))
    device_codes.forEach(element => {
      if (deviceCodeList.includes(element) && !finalDeviceCodeList.includes(element)) {
        dontHavePermissions.push(element)
      }
    })
    async function getShadow(element, company_id) {
      let deviceCode = element
      let params = {
        thingName: element, // required
      };
      let result = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'getThingShadow')
      let finalResult = {}
      finalResult[deviceCode] = result
      return finalResult
    }
    // check whether device exists or not
    let promiseList = []
    finalDeviceCodeList.forEach((element) => {
      promiseList.push(getShadow(element, company_id))
    })

    let shadows = await Promise.all(promiseList).then(result => {
      return result
    }).catch(error => {
      throw error
    })
    const combinedObject = {}; // Spread operator to copy mainObject

    shadows.forEach(obj => {
      Object.assign(combinedObject, obj);
    });
    const entries = Object.entries(combinedObject);
    for (const [key, value] of entries) {
      if (value == null) {
        errorList.push(key)
      } else {
        successList.push({
          device_code: key,
          payload: value ? value["payload"] : {}
        })
      }
    }
    return {
      success_list: successList,
      dont_have_permissions_list: dontHavePermissions,
      device_not_found_list: notFoundList,
      error_list: errorList
    };
  }

  static async getAdminData(companyId) {
    const adminemail = process.env.ADMIN_EMAIL || 'nikhil.s@ctiotsolution.com';
    const password = process.env.ADMIN_PASSWORD || '5Gen@123';
    const AdminData = await UsersService.cognitoLogin({ body: { company_id: companyId } }, adminemail, password);
    return AdminData;
  }

  static async getProvisionDetails(locationId, role, command, companyId) {
    //role :- will skip the users whos role matched with param role
    const currentLocation = await LocationsService.getLocation(locationId);
    if (!currentLocation) {
      Logger.error(`getProvisionDetails location not found with id  ${locationId}`);
      throw Error(JSON.stringify({ error: '150003' }));
    }
    let locationsIds = Object.keys(currentLocation.path)
      .map((key) => {
        if (key !== 'breadcrumb') {
          return key;
        }
      }).filter((item) => item);
    locationsIds = [...locationsIds, locationId]
    //1. get locationManagers list by locationId
    const queryUsersList = `SELECT DISTINCT u.email,u.id,u.name,u.identity_id,lp.role FROM users u 
    INNER JOIN locations_permissions lp ON lp.user_id = u.id
    WHERE lp.location_id IN (:locationIds)`;
    let usersList = []
    usersList = await database.sequelize.query(queryUsersList,
      {
        raw: true,
        replacements: {
          locationIds: locationsIds,
        },
        logging: console.log,
        model: database.devices,
      });
    if (role && usersList.length > 0) {
      usersList = usersList.map(u => {
        if (u.role !== role) return u;
      }).filter(a => a);
    }
    let lockUnlockCommand = -1;
    if (command === DPCommands.share) {
      lockUnlockCommand = DPCommands.lockUser;
    } else if (command === DPCommands.unshare) {
      lockUnlockCommand = DPCommands.unlockUser;
    } else {
      Logger.error(` getProvisionDetails Error command not valid ${command} ${userid}`);
      throw Error(JSON.stringify({ error: '400002' }));
    }
    const input = {
      usersList,
      command,
      lockUnlockCommand,
    };
    return input;
  }

  static async updateSharerListOnDeviceLocationUpdation(inputDetail, locationId, deviceCode, deviceType, companyId, loggedInUserId, adminData, requestid) {
    const metadata = { locationId, deviceCode, percentage: 0 }
    const input = {
      ...inputDetail,
      accessToken: adminData.accessToken,
      adminIdentityId: adminData.identityId,
      deviceCode,
      deviceType,
      metadata
    };
    const job = await jobsService.createJob('deviceLocationAssignment', input, companyId, loggedInUserId, loggedInUserId, metadata, requestid)
      .then(async (resp) => resp)
      .catch((err) => {
        throw (err);
      });
    return job;
  }

  static async checkGatewayExist(bluetooth_id, mdns_id, occupant_id) {
    let gatewayMacAddress = null;
    let isRegistered = false
    var gatewayShadow = null
    var coordinatorShadow = null
    var coordinatorDevice = null
    if (mdns_id) {
      const mdnsId = mdns_id.split('-')
      gatewayMacAddress = mdnsId[1]
    }
    else {
      const blueToothId = bluetooth_id.split('-')
      gatewayMacAddress = blueToothId[1]
      if (gatewayMacAddress.length > 12) {
        gatewayMacAddress = gatewayMacAddress.substr(gatewayMacAddress.length - 12)
      }
    }
    if (gatewayMacAddress) {

      var findGateway = await database.devices.findOne({
        where: {
          device_code: {
            [Op.iLike]: `%${gatewayMacAddress}%`,
          },
          type: 'gateway'
        }
      })
      if (findGateway) {
        coordinatorDevice = await database.devices.findOne({
          where: {
            gateway_id: findGateway.id,
            type: 'coordinator_device'
          }
        })
        var findPermissionForGateway = await database.occupants_permissions.findAll({
          where: {
            gateway_id: findGateway.id,
          }
        })
        if (findPermissionForGateway && findPermissionForGateway.length > 0) {
          var findOccupantPermissionForGateway = await database.occupants_permissions.findOne({
            where: {
              gateway_id: findGateway.id,
              receiver_occupant_id: occupant_id,
              sharer_occupant_id: occupant_id,
            }
          })
          if (findOccupantPermissionForGateway) {
            isRegistered = false;
          } else {
            isRegistered = true;
          }

        }
        //Need to return  the gateway and coodinator device shadow if gateway exists in db
        var gatewayParams = {
          thingName: findGateway.device_code,
        };
        var gatewayShadowPayload = await communicateWithAwsIotService.communicateWithAwsIot(gatewayParams, findGateway.company_id, 'getThingShadow').then((data) => data);

        if (gatewayShadowPayload) {
          gatewayShadow = JSON.parse(gatewayShadowPayload.payload);
        }
        if (coordinatorDevice) {
          var coordinatorParams = {
            thingName: coordinatorDevice.device_code,
          };
          var coordinatorShadowPayload = await communicateWithAwsIotService.communicateWithAwsIot(coordinatorParams, findGateway.company_id, 'getThingShadow').then((data) => data);
          if (coordinatorShadowPayload) {
            coordinatorShadow = JSON.parse(coordinatorShadowPayload.payload);
          }
        }
      }
    }
    return {
      registered: isRegistered,
      gateway_shadow: gatewayShadow,
      coordinator_shadow: coordinatorShadow
    };
  }
  static async gatewayCameraPlanLink(camera_device_id, gateway_id, occupant_id, company_id, user_id, active, identity_id, source_IP) {
    const gatewayExist = await database.devices.findOne({
      where: {
        id: gateway_id,
      }
    }).then((result) => result)
      .catch((error) => {
        throw error;
      });

    if (!gatewayExist) {
      const err = ErrorCodes['800013']; // gateway not found
      throw err;
    }
    let updateCameraDevices = null;
    let subscribe_value = null;
    const cameraDeviceExist = await database.camera_devices.findOne({
      where: {
        id: camera_device_id,
        occupant_id,
        gateway_id
      }
    }).then((result) => result)
      .catch((error) => {
        throw error;
      });
    if (!cameraDeviceExist) {
      const err = ErrorCodes['470005']; // camera device not found
      throw err;
    }
    const companyExist = await getCompany(company_id).then(result => {
      return (result);
    }).catch((error) => {
      console.log(err);
      throw (error);
    });
    if (!companyExist) {
      const err = ErrorCodes['000001']; // company not found
      throw err;
    }
    let plan_code = gatewayExist.plan_code;
    const plan_limitations = companyExist.plan_limitations;
    let plan_limit_count = 0;
    const plan_limit_keyItem = Object.keys(plan_limitations);
    // check company exist or not
    if (active == true) {
      if (plan_code != null) {
        // check whether the plan_limitation includes plan_code or not
        if (plan_limit_keyItem.includes(plan_code)) {
          const plan_limit_value = plan_limitations[plan_code];
          // get the count value of inner json
          plan_limit_count = plan_limit_value['cameras'];
          const plan_code_count = await database.camera_devices.count({
            where: {
              gateway_id,
              plan_code: plan_code
            }
          }).then((result) => result)
            .catch((error) => {
              throw error;
            });
          if (plan_limit_count && plan_limit_count <= plan_code_count) {
            // throw error limit
            let err = ErrorCodes['470011']; // camera device not found
            err.message = `${plan_limit_count} cameras only can be added`;
            throw err;
          }
        }
      }
      else {
        const err = ErrorCodes['470012']; // company not found
        throw err;
      }
      updateCameraDevices = await database.camera_devices.update(
        { plan_code }, {
        where: { id: cameraDeviceExist.id },
        returning: true,
      }).then(async (result) => {
        if (result) {
          const cameraDevice = await database.camera_devices.findOne({
            where: {
              id: camera_device_id,
              occupant_id,
              gateway_id
            }
          })
          return cameraDevice
        }
      }).catch(() => {
        const err = ErrorCodes['470009'];
        throw err;
      });
      subscribe_value = 'subscribe'
      const obj = {
        old: cameraDeviceExist,
        new: updateCameraDevices,
      };
      ActivityLogs.addActivityLog(Entities.camera_devices.entity_name, Entities.camera_devices.event_name.updated,
        obj, Entities.notes.event_name.updated, gateway_id, company_id, user_id, null, null, source_IP);

    } else {
      updateCameraDevices = await database.camera_devices.update(
        {
          plan_code: null
        }, {
        where: { id: cameraDeviceExist.id },
        returning: true,
      }).then(async (result) => {
        if (result) {
          const cameraDevice = await database.camera_devices.findOne({
            where: {
              id: camera_device_id,
              occupant_id,
              gateway_id
            }
          })
          return cameraDevice
        }
      }).catch(() => {
        const err = ErrorCodes['470009'];
        throw err;
      });
      subscribe_value = 'unsubscribe'
      plan_code = null;
      const obj = {
        old: cameraDeviceExist,
        new: updateCameraDevices,
      };
      ActivityLogs.addActivityLog(Entities.camera_devices.entity_name, Entities.camera_devices.event_name.updated,
        obj, Entities.notes.event_name.updated, gateway_id, company_id, user_id, null, null, source_IP);
    }
    const data = {
      occupant_id: identity_id,
      camera_id: cameraDeviceExist.camera_id,
      action: {
        type: 'subscription',
        event: subscribe_value,
        value: {
          plan_code: plan_code
        },
      },
      time: new Date()
    }
    // send this object in action queue
    cameraDeviceActionQueue.sendProducer(data);
    let cameraItem = {
      id: updateCameraDevices.id, name: updateCameraDevices.name, type: updateCameraDevices.type,
      camera_id: updateCameraDevices.camera_id, gateway_id: updateCameraDevices.gateway_id,
      company_id: updateCameraDevices.company_id, occupant_id: updateCameraDevices.occupant_id,
      plan_code: updateCameraDevices.plan_code, dashboard_attributes: { type: "camera" }
    };

    return cameraItem;
  }

  static async gatewayCameraLink(camera_device_ids, gateway_id, occupant_id, company_id, user_id, identity_id, source_IP) {
    const gatewayExist = await database.devices.findOne({
      where: {
        id: gateway_id,
        // type: 'gateway'
      }
    }).then((result) => result)
      .catch((error) => {
        throw error;
      });

    if (!gatewayExist) {
      const err = ErrorCodes['800013']; // gateway not found
      throw err;
    }
    //check user has permission of gateway or not
    const hasOccupantsPermissions = await database.occupants_permissions.findOne({
      where: {
        gateway_id,
        receiver_occupant_id: occupant_id
      }
    }).then(result => result)
      .catch(() => {
        const err = ErrorCodes['490003'];
        throw err;
      });
    if (!hasOccupantsPermissions || hasOccupantsPermissions.length < 1) {
      const err = ErrorCodes['160026']; // occupant permission has no record
      throw err;
    }
    if (hasOccupantsPermissions.receiver_occupant_id != hasOccupantsPermissions.sharer_occupant_id) {
      const err = ErrorCodes['140000']; // User not authorized to access this resource
      throw err;
    }

    let unlink_gateway_camera_ids = [];
    let camera_device_ids_db = [];
    let total_camera_device_updating_ids = [];
    if (camera_device_ids) {
      // find all array camera_device_ids exists or not
      const cameraDevicesExists = await database.camera_devices.findAll({
        where: {
          id: { [Op.in]: camera_device_ids }
        },
      }).catch(error => {
        const err = ErrorCodes['460001']; // Error while getting camera devices
        throw (err);
      });
      if (cameraDevicesExists && cameraDevicesExists.length != camera_device_ids.length) {
        const err = ErrorCodes['460002']; // camera device not exists
        throw (err);
      };
      //check provided camera hey have access or not
      const cameraDevicesOwn = await database.camera_devices.findAll({
        where: {
          occupant_id: occupant_id,
        },
      }).then(async (data) => {
        if (data && data.length > 0) {

          data.forEach((element) => {
            camera_device_ids_db.push(element.id);
          })
          //check all camera id provided are valid
          camera_device_ids.forEach((id) => {
            if (!camera_device_ids_db.includes(id)) {
              const err = ErrorCodes['470005']; // camera device not found
              throw err;
            }
          })
          //find unlink camera device list
          data.forEach((element) => {
            let cam_device_id = element.id;
            if (!camera_device_ids.includes(cam_device_id)) {
              //check has linked to same gateway, then only unlink
              if (element.gateway_id == gateway_id) {
                total_camera_device_updating_ids.push(element.id)
                unlink_gateway_camera_ids.push(element.id)
              }
            } else {
              if (camera_device_ids.includes(cam_device_id)) {
                total_camera_device_updating_ids.push(element.id)
              }
            }
          });
        }
      }).catch((error) => {
        const err = ErrorCodes['460001'];
        throw (err);
      });

    }

    //unlink camera from gateways
    const unlinkCameraDevices = await database.camera_devices.update(
      {
        gateway_id: null,
        plan_code: null,
      }, {
      where: {
        id: {
          [Op.in]: unlink_gateway_camera_ids
        }
      },
      returning: true,
    }).then((result) => result)
      .catch(() => {
        const err = ErrorCodes['470009'];
        throw err;
      });
    //remove camera device permissions which are unlinked from gateways
    const deleteOccupantsCameraPermissions = await database.occupants_camera_permissions.destroy({
      where: {
        camera_device_id: {
          [Op.in]: unlink_gateway_camera_ids
        },
      }
    }).catch((error) => {
      const err = ErrorCodes['490002'];
      throw err;
    });
    // unsubscribe the camera which are unlinked
    for (const ele in unlink_gateway_camera_ids) {
      const cam = unlink_gateway_camera_ids[ele];
      const camera = await database.camera_devices.findOne({
        where: {
          id: cam,
        }
      })
      const data = {
        occupant_id: identity_id,
        camera_id: camera.camera_id,
        action: {
          type: 'subscription',
          event: 'unsubscribe',
          value: {
            plan_code: null
          },
        },
        time: new Date()
      }
      // send this object in action queue
      cameraDeviceActionQueue.sendProducer(data);

      const info = {
        occupant_id: identity_id,
        camera_id: camera.camera_id,
        gateway_id: camera.gateway_id,
        action: {
          type: "Gateway",
          event: "unlinked",
          value: {
            camera_device_id: camera.id
          }
        },
        timestamp: new Date()
      }
      safe4camera.sendProducer(info);


    }
    const updateCameraDevices = await database.camera_devices.update(
      {
        gateway_id: gateway_id
      }, {
      where: {
        id: {
          [Op.in]: camera_device_ids
        }
      },
      returning: true,
    }).catch(() => {
      const err = ErrorCodes['470009'];
      throw err;
    });
    //link camera to gateway
    if (gatewayExist.plan_code === 'advanced') {
      for (const ele in camera_device_ids) {
        const cam = camera_device_ids[ele];
        let plan_code = null;
        const companyExist = await getCompany(gatewayExist.company_id).then(result => {
          return (result);
        }).catch((error) => {
          console.log(err);
          throw (error);
        });
        plan_code = gatewayExist.plan_code;
        const plan_limitations = companyExist.plan_limitations;
        let plan_limit_count = 0;
        const plan_limit_keyItem = Object.keys(plan_limitations);
        // check company exist or not
        if (plan_code != null) {
          // check whether the plan_limitation includes plan_code or not

          if (plan_limit_keyItem.includes(plan_code)) {
            const plan_limit_value = plan_limitations[plan_code];
            // get the count value of inner json
            plan_limit_count = plan_limit_value['cameras'];
            const plan_code_count = await database.camera_devices.count({
              where: {
                gateway_id,
                plan_code: plan_code
              }
            }).then((result) => result)
              .catch((error) => {
                throw error;
              });
            if (plan_limit_count && plan_limit_count <= plan_code_count) {
              plan_code = null;
            }
          } else {
            plan_code = null;
          }
        }

        const updateCameraDevices = await database.camera_devices.update(
          {
            gateway_id: gateway_id,
            plan_code: plan_code
          }, {
          where: {
            id: cam
          },
          returning: true,
        }).catch(() => {
          const err = ErrorCodes['470009'];
          throw err;
        });

        // subscribe the camera which are linked to gateway

        const camera = await database.camera_devices.findOne({
          where: {
            id: cam,
          }
        })
        const data = {
          occupant_id: identity_id,
          camera_id: camera.camera_id,
          action: {
            type: 'subscription',
            event: 'subscribe',
            value: {
              plan_code: plan_code
            },
          },
          time: new Date()
        }
        // send this object in action queue
        cameraDeviceActionQueue.sendProducer(data);

        const info = {
          occupant_id: identity_id,
          camera_id: camera.camera_id,
          gateway_id: camera.gateway_id,
          action: {
            type: "Gateway",
            event: "linked",
            value: {
              camera_device_id: camera.id
            }
          },
          timestamp: new Date()
        }
        safe4camera.sendProducer(info);

      }
    }
    //add log regarding updated camera
    const cameraDevicesOwn = await database.camera_devices.findAll({
      where: {
        occupant_id: occupant_id,
        id: {
          [Op.in]: camera_device_ids
        }
      },
    }).then((data) => {
      if (data && data.length > 0) {
        data.forEach((obj) => {
          ActivityLogs.addActivityLog(Entities.camera_devices.entity_name, Entities.camera_devices.event_name.updated,
            obj, Entities.notes.event_name.updated, gateway_id, company_id, user_id, null, null, source_IP);
        })
      }
    }).catch((error) => {
      const err = ErrorCodes['460001'];
      throw (err);
    });

    // call slider details api for return
    const occupantGatewaySliderDetails = await OccupantService.getSliderGatewayDetails(gateway_id, occupant_id, company_id)
      .then(async (result) => result).catch((error) => {
        throw (err);
      });

    // add camera dashboard  in response
    const occupantCameraSliderDetails = await OccupantService.getSliderCameraDetails(occupant_id, company_id)
      .then(async (result) => result).catch((err) => {
        throw err;
      });

    const occupantCameraOutput = (occupantCameraSliderDetails && Object.keys(occupantCameraSliderDetails).length > 0) ? occupantCameraSliderDetails : {};
    // combine response includes gateway and camera_dashboard both.
    const response = {
      gateway: occupantGatewaySliderDetails,
      camera_dashboard: occupantCameraOutput
    }
    return response;
  }

  static async gatewayCameraList(gatewayid, gateway_code, occupant_id, user_id, isAdmin = false) {
    let gatewayLinkedCamera = [];
    let where = {};
    where = (gatewayid) ? { id: gatewayid } : { device_code: gateway_code };
    // check sent gateway exist or not
    const gatewayExist = await database.devices.findOne({ where, })
      .then((result) => result)
      .catch((error) => {
        throw error;
      });
    if (!gatewayExist) {
      const err = ErrorCodes['800013']; // gateway not found
      throw err;
    }
    const gateway_id = gatewayExist.id;
    if (user_id || isAdmin == true) {
      // get all linked cameras of the user with this gateway
      gatewayLinkedCamera = await database.camera_devices.findAll({
        where: {
          gateway_id
        },
        include: [{
          attributes: ['id', 'name', 'device_code'],
          model: database.devices,
          as: 'gateway'
        }],
      }).catch((error) => {
        const err = ErrorCodes['490002'];
        throw err;
      });
    }

    if (occupant_id && isAdmin == false) {
      // check the occupant for adding gateway has any(1 or more) gateway and camera permission by checking it in occ_per table
      const hasOccupantsPermissions = await database.occupants_permissions.findAll({
        where: {
          gateway_id,
          receiver_occupant_id: occupant_id
        }
      }).then(result => result)
        .catch(() => {
          const err = ErrorCodes['490003'];
          throw err;
        });

      let presentCameraList = [];
      if (hasOccupantsPermissions && hasOccupantsPermissions.length > 0) {
        for (const key in hasOccupantsPermissions) {
          const element = hasOccupantsPermissions[key];
          const occupant_permission_id = element.id;
          // check those occupant permissions present in occ_cam_per table
          if (element.receiver_occupant_id == element.sharer_occupant_id) {
            const hasOccupantsCameraPermissions = await database.occupants_camera_permissions.findAll({
              where: {
                occupant_permission_id,
              }
            }).then((result) => {
              if (result && result.length > 0) {
                // send the camera_device_list
                result.forEach((element) => {
                  let cam_device_id = element.camera_device_id;
                  presentCameraList.push(cam_device_id);
                });
              }
            }).catch((error) => {
              const err = ErrorCodes['490002'];
              throw err;
            });

            // check any cameras has for owner occupant
            const cameraDevicesOwn = await database.camera_devices.findAll({
              where: {
                gateway_id: element.gateway_id, occupant_id: element.receiver_occupant_id,
              },
            }).then((data) => {
              if (data && data.length > 0) {
                // send the camera_device_list
                data.forEach((element) => {
                  let cam_device_id = element.id;
                  if (!presentCameraList.includes(cam_device_id)) {
                    presentCameraList.push(cam_device_id);
                  }
                });
              }
            }).catch((err) => {
              Logger.error('error 3697:', err);
              throw (err);
            });
          } else if (element.receiver_occupant_id != element.sharer_occupant_id) {
            const hasOccupantsCameraPermissions = await database.occupants_camera_permissions.findAll({
              where: {
                occupant_permission_id,
              }
            }).then((result) => {
              if (result && result.length > 0) {
                // send the camera_device_list
                result.forEach((element) => {
                  let cam_device_id = element.camera_device_id;
                  presentCameraList.push(cam_device_id);
                });
              }
            }).catch((error) => {
              const err = ErrorCodes['490002'];
              throw err;
            });

          }// end of else if

        } // end for
      } // end if
      // if the hasGatewayCam permission is true then go agead
      if (hasOccupantsPermissions && hasOccupantsPermissions.length < 1) {
        return [];
      }
      // check occupant exist
      const occupantExist = await database.occupants.findOne({
        where: {
          id: occupant_id,
        }
      }).then((result) => result)
        .catch((error) => {
          throw error;
        });
      if (!occupantExist) {
        const err = ErrorCodes['160010']; // occupant not found
        throw err;
      }

      // check all the camera_device _ids present
      // if present send in output
      if (presentCameraList && presentCameraList.length > 0) {
        for (const key in presentCameraList) {
          const camera_device_id = presentCameraList[key];
          // check camera_device_ids has the record
          const cameraDeviceExist = await database.camera_devices.findOne({
            where: {
              id: camera_device_id,
              // occupant_id,
            },
            include: [{
              attributes: ['id', 'name', 'device_code'],
              model: database.devices,
              as: 'gateway'
            }],
          }).then((result) => result)
            .catch((error) => {
              throw error;
            });

          if (cameraDeviceExist) {
            gatewayLinkedCamera.push(cameraDeviceExist);
          }
        } // end of for
      } // end of if
    }
    return gatewayLinkedCamera;
  }

  static async setGatewayImage(gateway_id, imagePath, key) {
    const device = await database.devices.findOne({
      where: {
        id: gateway_id,
        type: 'gateway',
      },
    }).catch((error) => {
      throw (error);
    });

    if (device) {
      const s3 = new AWS.S3({
        accessKeyId: process.env.SQS_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.SQS_AWS_SECRET_ACCESS_KEY,
      })
      const blob = fs.readFileSync(imagePath)
      const uploadedImage = await s3.upload({
        Bucket: process.env.GATEWAY_IMAGE_S3_BUCKET,
        Key: key,
        Body: blob,
      }).promise();
      const url = uploadedImage.Location;
      fs.unlinkSync(imagePath);
      return { gateway_image_url: url };
    }
    else {
      fs.unlinkSync(imagePath);
      const err = ErrorCodes['800013'];
      throw err;
    }
  }

  static async getRuleTriggerKeyValue(rule) {
    const str = JSON.stringify(rule);
    const re = /ruleTriggerKey-[A-Z a-z \- 0-9]*/gi;
    const ruleTriggerKey = str.match(re);
    if (ruleTriggerKey && ruleTriggerKey.length > 0) {
      return ruleTriggerKey[0]
    } else {
      return null
    }
  }

  static async uploadFileOneTouch(token, company_id, filePath, occupant_id, user_id, source_IP) {
    let where = {};
    const deviceReferenceExist = await database.device_references.findOne({
      where: {
        id: token, type: 'one_touch_rule',
      },
    }).catch((error) => {
      throw (error);
    });
    if (!deviceReferenceExist) {
      fs.unlinkSync(filePath);
      const err = ErrorCodes['470001'];
      throw err;
    }
    const gateway_id = deviceReferenceExist.device_id;
    const deviceExist = await database.devices.findOne({
      where: {
        id: gateway_id,
        type: 'gateway',
      },
    }).catch((error) => {
      throw (error);
    });
    if (!deviceExist) {
      fs.unlinkSync(filePath);
      const err = ErrorCodes['800013'];
      throw err;
    }
    const gateway_code = deviceExist.device_code;
    let key = null;
    const file = fs.readFileSync(filePath);
    const jsonFileData = JSON.parse(Buffer.from(file));
    // remove stored file
    fs.unlinkSync(filePath);

    // rule array and for loop to fing rule triggerkey
    const { rules } = jsonFileData;
    let rule_trigger_key = null;
    if (rules && rules.length > 0) {

      // get and store all the shared rules key in a array
      let sentKeyArray = []; // all the keys of one touch rules
      // get all the rules present for the input device_id do findAll
      const presentOneTouchRulesforGateway = await database.one_touch_rules.findAll(
        { where: { gateway_id } })
        .catch((error) => {
          throw (error);
        });

      for (const element in rules) {
        const rule = rules[element];
        key = rule.key;
        // pushing key in sentkey array
        sentKeyArray.push(key);

        let rule_trigger_key = await this.getRuleTriggerKeyValue(rule)
          .then(result => {
            return result
          })
          .catch(err => {
            throw err;
          })

        where = (rule_trigger_key != null) ? { rule_trigger_key } : { key };

        const recordExist = await database.one_touch_rules.findOne({
          where,
        }).then(result => {
          return result
        }).catch(err => {
          throw err;
        })

        if (recordExist && Object.keys(recordExist).length > 0) {
          // update existing record
          const oneTouchRuleObj = await database.one_touch_rules.update({
            rule,
          }, {
            where,
            returning: true,
          }).then((result) => result)
            .catch(() => {
              const err = ErrorCodes['330001'];
              throw err;
            });
          const afterUpdateOneTouchRule = await database.one_touch_rules.findOne({
            where,
          }).catch((error) => {
            const err = ErrorCodes['330002'];
            throw err;
          });

          if (!afterUpdateOneTouchRule) {
            const err = ErrorCodes['330002'];
            throw err;
          }
          const obj = {
            new: oneTouchRuleObj[1][0],
            old: recordExist,
          };
          const placeholdersData = {};
          if (JSON.stringify(recordExist.rule) !== JSON.stringify(afterUpdateOneTouchRule.rule)) {
            ActivityLogs.addActivityLog(Entities.one_touch_rules.entity_name,
              Entities.one_touch_rules.event_name.updated, obj, Entities.notes.event_name.updated, recordExist.id,
              company_id, user_id, occupant_id, placeholdersData, source_IP);
          }
        } else {
          // create new one touch record
          const oneTouchRuleObj = await database.one_touch_rules.create({
            rule, rule_trigger_key, key, gateway_id, company_id,
          }).then((result) => result)
            .catch((error) => {
              const err = ErrorCodes['330000'];
              throw err;
            });

          if (!oneTouchRuleObj) {
            const err = ErrorCodes['330000'];
            throw err;
          }
          const obj = {
            old: {},
            new: oneTouchRuleObj,
          };
          const placeholdersData = {};
          ActivityLogs.addActivityLog(Entities.one_touch_rules.entity_name, Entities.one_touch_rules.event_name.added,
            obj, Entities.notes.event_name.added, oneTouchRuleObj.id, company_id, user_id, occupant_id, placeholdersData, source_IP);

        }
      } // end of for

      // perform the task of deleting one touch rules if not present or extra here
      // apply for loop on present one touch and  if key !includes in sent key  array delete record
      if (presentOneTouchRulesforGateway && presentOneTouchRulesforGateway.length > 0) {
        for (const attr in presentOneTouchRulesforGateway) {
          const element = presentOneTouchRulesforGateway[attr]; // single one touch rule
          const one_touch_key = element.key;
          if (!sentKeyArray.includes(one_touch_key)) {
            const key_to_delete = one_touch_key;
            await database.one_touch_rules.destroy({
              where: {
                key: key_to_delete, gateway_id
              }
            }).catch(() => {
              const err = ErrorCodes['330004'];
              throw err;
            })
          }
        }
      }
      // creeting reference in device_references.
      const createDeviceReferenceObj = await OneTouchRulesService.addDeviceReference(gateway_id);
      if (!createDeviceReferenceObj) {
        const err = ErrorCodes['410006'];
        throw err;
      }
      const ref = createDeviceReferenceObj.id;
      const host = process.env.SERVICE_API_HOST;
      const url = `https://${host}/api/v1/one_touch/gateway_rules?ref=${ref}`;
      // creates a json object
      await OneTouchRulesService.publishJsonUrl(company_id, gateway_code, url);

      // after publishing delete the device reference id record
      await database.device_references.destroy({
        where: {
          id: deviceReferenceExist.id
        }
      }).catch(() => {
        const err = ErrorCodes['470003'];
        throw err;
      });
      const obj = {
        old: deviceReferenceExist,
        new: {}
      }
      ActivityLogs.addActivityLog(Entities.device_references.entity_name, Entities.device_references.event_name.deleted,
        obj, Entities.notes.event_name.deleted, gateway_id, company_id, user_id, occupant_id, null, source_IP);

    } // end of if

  }

  static async uploadFileSchedules(token, company_id, filePath, occupant_id, user_id, source_IP) {

    let calculateScheduleSize = null;
    let calculateScheduleSizeAdd = null;
    let actionLength = 0;

    const deviceReferenceExist = await database.device_references.findOne({
      where: {
        id: token, type: 'schedule'
      },
    }).catch((error) => {
      throw (error);
    });
    if (!deviceReferenceExist) {
      fs.unlinkSync(filePath);
      const err = ErrorCodes['470001'];
      throw err;
    }
    const { device_id } = deviceReferenceExist;
    const deviceExist = await database.devices.findOne({
      where: {
        id: device_id,
        [Op.or]: [
          { type: 'device' },
          { type: null },
        ],
      },
    }).catch((error) => {
      const err = ErrorCodes['800019'];
      throw err;
    });
    if (!deviceExist) {
      fs.unlinkSync(filePath);
      const err = ErrorCodes['800019'];
      throw err;
    }
    const { gateway_id } = deviceExist; // devices gateway
    const { device_code } = deviceExist;
    // check deviceId has max 200 records
    const deviceScheduleCount = await SchedulesService.countDeviceId(device_id, company_id);
    if (deviceScheduleCount > 200) {
      const err = ErrorCodes['410010'];
      throw err;
    }
    // read the json schedules file.
    const file = fs.readFileSync(filePath);
    const jsonFileData = JSON.parse(Buffer.from(file));
    // remove stored file
    fs.unlinkSync(filePath);

    // schedules array and for loop to get schedule
    const { schedules } = jsonFileData;
    if (schedules && schedules.length > 0) {
      for (const key in schedules) {
        const schedule = schedules[key];
        // check action size <= 20 in schedule
        actionLength = Object.keys(schedule.action).length;

        if (actionLength > 20) {
          const err = ErrorCodes['410009'];
          throw err;
        }
        // count each schedule size and add together
        calculateScheduleSize = await SchedulesService.calculateSize(schedule);
        calculateScheduleSizeAdd += calculateScheduleSize;
        calculateScheduleSize = calculateScheduleSizeAdd;

      }
    }
    // checking gateway online or offline
    const gatewayStatus = await SchedulesService.getDevice(gateway_id, company_id);

    if (gatewayStatus.status == 'offline') {
      const err = ErrorCodes['410008'];
      throw err;
    }
    // // check deviceid's code contains these 2 codes
    const matchCode = deviceExist.device_code;

    let combineSize = calculateScheduleSize;

    if (matchCode === 'CTLG633') { // 2mb
      if (combineSize > 2) {
        const err = ErrorCodes['410011'];
        throw err;
      }
    } else if (matchCode === 'SAU2AG1') { // 3mb
      if (combineSize > 3) {
        const err = ErrorCodes['410012'];
        throw err;
      }
    } else { // 5mb
      if (combineSize > 5) {
        const err = ErrorCodes['410013'];
        throw err;
      }
    }

    const deleteSchedules = await database.schedules.findAll({
      where: { device_id },
    });
    if (!deleteSchedules) {
      const err = ErrorCodes['800020']; // device id not found
      throw err;
    }
    if (deleteSchedules && deleteSchedules.length > 0) {
      // destroy all record at once based on device_id
      const deletedData = await database.schedules.destroy({
        where: { device_id: device_id },
      }).then((result) => result).catch((error) => {
        const err = ErrorCodes['410005'];
        throw err;
      });
      for (const key in deleteSchedules) {
        const element = deleteSchedules[key];
        const deviceId = element.device_id;
        const obj = {
          old: element,
          new: {},
        };
        ActivityLogs.addActivityLog(Entities.schedules.entity_name, Entities.schedules.event_name.deleted,
          obj, Entities.notes.event_name.deleted, deviceId, company_id, user_id, occupant_id, null, source_IP);
      }
    }

    // for loop for adding all records
    if (schedules && schedules.length > 0) {
      for (const key in schedules) {
        const schedule = schedules[key];
        const addSchedules = await database.schedules.create({
          schedule, device_id, company_id,
        }).then((result) => result).catch((error) => {
          const err = ErrorCodes['410003'];
          throw err;
        });
        const obj = {
          old: {},
          new: addSchedules,
        };
        if (addSchedules) {
          ActivityLogs.addActivityLog(Entities.schedules.entity_name, Entities.schedules.event_name.added,
            obj, Entities.notes.event_name.added, addSchedules.id, company_id, user_id, occupant_id, null, source_IP);
        }
      }
    }
    // creeting reference in device_references.
    const createDeviceReferenceObj = await this.addDeviceReference(device_id);
    if (!createDeviceReferenceObj) {
      const err = ErrorCodes['410006'];
      throw err;
    }
    const ref = createDeviceReferenceObj.id;
    const host = process.env.SERVICE_API_HOST;
    const url = `https://${host}/api/v1/schedules/device_schedules?ref=${ref}`;
    await SchedulesService.publishGenScheURL(company_id, device_code, url);

    // after publishing delete the device reference id record
    await database.device_references.destroy({
      where: {
        id: deviceReferenceExist.id
      }
    }).catch(() => {
      const err = ErrorCodes['470003'];
      throw err;
    });
    const obj = {
      old: deviceReferenceExist,
      new: {}
    }
    ActivityLogs.addActivityLog(Entities.device_references.entity_name, Entities.device_references.event_name.deleted,
      obj, Entities.notes.event_name.deleted, device_id, company_id, user_id, occupant_id, null, source_IP);

    // #1.. first check whether device_id present in scd's table or not if yes
    // #2.. get the scd_id's other connected device_id list
    // #1..
    const checkSCD_Exist = await SingleControlsService.getSingleControlDevices(device_id)
      .catch((err) => {
        throw err;
      });
    if (checkSCD_Exist && Object.keys(checkSCD_Exist).length > 0) {
      // #2..
      const allDevicesList = await SingleControlsService.getSingleControlDevicesList(checkSCD_Exist.single_control_id)
        .catch((err) => {
          throw err;
        });
      if (allDevicesList && allDevicesList.length > 0) {
        const devicesList = lodash.map(allDevicesList, 'device_id');
        //  #3.. call the duplicate schedules function to create the same record for all the devices
        await SchedulesService.updateDuplicateSchedules(device_id, devicesList, user_id, occupant_id, company_id, "single_control", source_IP)
          .then((result) => result).catch((e) => {
            const err = e;
            throw (err);
          });
      }
    }
  }
  static async getThingsFromThingGroup(device_code, company_id, deviceFullList) {
    let things = []
    let deviceCodeSplitArray = device_code.split('-')
    let thingGroupName = 'Gateway-' + deviceCodeSplitArray[1]
    let params = {
      thingGroupName
    };
    const getGatewayThings = await communicateWithAwsIotService.communicateWithAwsIot(params, company_id, 'listThingsInThingGroup')
      .then(data => { return (data) })
      .catch(err => { throw (err) });
    if (getGatewayThings) {
      if (!getGatewayThings.things || getGatewayThings.things.length == 0) {
        return []
      } else {
        if (getGatewayThings.things.length > 0) {
          let success = true
          for (let index = 0; index < deviceFullList.length; index++) {
            const element = deviceFullList[index];
            if (element.startsWith('00000')) {
              continue;
            }
            let thing = getGatewayThings.things.filter(u => u.toLowerCase().endsWith(element));
            if (thing && thing.length > 0) {
              things.push(thing[0])
            } else {
              success = false
              break;
            }
          }
          if (success == false) {
            things = []
            await this.sleep(2000)
            let result = await this.getThingsFromThingGroup(device_code, company_id, deviceFullList)
            return result
          } else {
            return things
          }
        }
      }
    } else {
      return []
    }
  }
  static async localCloudSyncup(gateway_id, occupant_id, company_id, source_IP) {
    const gatewayExist = await database.devices.findOne({
      where: {
        id: gateway_id,
        type: 'gateway'
      }
    }).then((result) => result)
      .catch(() => {
        const err = ErrorCodes['800013']; // gateway not found
        throw err;
      });
    if (!gatewayExist) {
      const err = ErrorCodes['800013']; // gateway not found
      throw err;
    }
    const gatewayShadowData = await this.getThingShadow(gatewayExist.device_code, company_id).catch((error) => {
      throw error;
    });
    if (gatewayShadowData) {
      let deviceFullListProperty = Object.keys(gatewayShadowData.properties).filter((name) => name.endsWith(":deviceFullList"));
      if (!deviceFullListProperty || deviceFullListProperty.length < 1) {
        return { message: "DeviceFullList is empty, Devices not found to add." }
      }
      let deviceFullListValue = gatewayShadowData.properties[deviceFullListProperty[0]]
      let deviceFullListSplice = deviceFullListValue.slice(1, -1);
      let deviceFullList = deviceFullListSplice.split(",")
      if (deviceFullList.length > 0) {
        let things = await this.getThingsFromThingGroup(gatewayExist.device_code, company_id, deviceFullList)
        if (things && things.length > 0) {
          for (let index = 0; index < things.length; index++) {
            const thing = things[index];
            let findDevice = await database.devices.findOne({
              where: {
                device_code: thing
              }
            })
            if (findDevice) {
              let updateDevice = await database.devices.update({
                is_manually_added: true,
                registered_at: new Date(),
                gateway_id
              },
                {
                  where: {
                    device_code: thing
                  },
                  returning: true,
                }).catch(() => {
                  const err = ErrorCodes['800015'];
                  throw err
                })
              let input = {
                item_id: findDevice.id,
                type: 'device',
                grid_order: await OccupantsGroupsService.getRandomGridOrder(),
              };
              await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(input, company_id, occupant_id, source_IP)
                .catch((err) => {
                  throw err
                });
              let obj = {
                old: findDevice,
                new: {
                  is_manually_added: true,
                  registered_at: new Date()
                }
              }
              ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.updated,
                obj, Entities.notes.event_name.updated, findDevice.id, company_id, null, occupant_id, null, source_IP);
            } else {
              let deviceCodeSplitArray = thing.split('-')
              let model = deviceCodeSplitArray[2]
              let mac_address = deviceCodeSplitArray[3]
              let createDevice = await database.devices.create({
                is_manually_added: true,
                device_code: thing,
                model,
                gateway_id,
                mac_address,
                registered_at: new Date(),
              }).catch(() => {
                const err = ErrorCodes['800014'];
                throw err
              })
              let input = {
                item_id: createDevice.id,
                type: 'device',
                grid_order: await OccupantsGroupsService.getRandomGridOrder(),
              };
              await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(input, company_id, occupant_id)
                .catch((err) => {
                  throw err
                });
              const activityLogObj = {
                old: {},
                new: createDevice,
              };
              ActivityLogs.addActivityLog(Entities.devices.entity_name, Entities.devices.event_name.added,
                activityLogObj, Entities.notes.event_name.added, createDevice.id, company_id, null, occupant_id, null, source_IP);
            }
          }
        }
        return { message: "Devices added successfully." }
      } else {
        return { message: "DeviceFullList is empty, Devices not found to add." }
      }
    } else {
      return { message: "Gateway shadow not found." }
    }
  }

  static async getPinCodeDetails(pincode) {
    const apiKey = process.env.GOOGLE_MAP_KEY
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${apiKey}`;
    try {
      const geocodeResponse = await axios.get(geocodeUrl);
      if (geocodeResponse.data.status !== "OK") throw new Error("No address found");
      const result = geocodeResponse.data.results[0];
      const addressComponents = result.address_components;
      let city = "", state = "", country = "";
      addressComponents.forEach(component => {
        if (component.types.includes("locality") || component.types.includes("postal_town") || component.types.includes("administrative_area_level_3")) {
          city = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1")) {
          state = component.long_name;
        }
        if (component.types.includes("country")) {
          country = component.long_name;
        }
      });
      const { lat, lng } = result.geometry.location;
      const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${apiKey}`;
      const timezoneResponse = await axios.get(timezoneUrl);
      if (timezoneResponse.data.status !== "OK") throw new Error("No timezone found");
      const timezone = timezoneResponse.data.timeZoneId;
      return { city, state, country, timezone };
    } catch (error) {
      console.error("Error fetching address:", error.message);
      return {}
    }
  }

  static async updateGatewaySettings(gateway_id, occupant_id,global_time_format_24_hour,company_id) {
    const gatewayExist = await database.devices.findOne({
      where: {
        id: gateway_id,
        type: 'gateway'
      }
    }).then((result) => result)
      .catch(() => {
        const err = ErrorCodes['800013']; // gateway not found
        throw err;
      });
    if (!gatewayExist) {
      const err = ErrorCodes['800013']; // gateway not found
      throw err;
    }
    const hasOccupantsPermissions = await database.occupants_permissions.findAll({
      where: {
        gateway_id,
        receiver_occupant_id: occupant_id
      }
    }).then(result => result)
      .catch(() => {
        const err = ErrorCodes['490003'];
        throw err;
      });
    if (!hasOccupantsPermissions || hasOccupantsPermissions.length < 1) {
      const err = ErrorCodes['160026']; // occupant permission has no record
      throw err;
    }
    if(global_time_format_24_hour == 0 || global_time_format_24_hour == 1){
      let constant = {
        "global_temperature_display_mode": {
          "setProperty": "SetTemperatureDisplayMode",
          "property": "TemperatureDisplayMode"
        },
        "global_time_format_24_hour": {
          "setProperty": "SetTimeFormat24Hour",
          "property": "TimeFormat24Hour"
        },
        "global_time_format_24_hour_zc": {
          "setProperty": "SetTimeFormat24Hour",
          "property": "TimeFormat24Hour"
        }
      }
      let gateway = gatewayExist
        
      let devices = await database.devices.findAll({
        where: {
          gateway_id: gateway.id
        }
      }).catch((err) => {
        throw (err);
      });

      if (devices && devices.length > 0) {
        let promiseList = []
        for (const id in devices) {
          let device = devices[id];
          if (device.type != "coordinator_device" && [1, 0, "1", "0"].includes(global_time_format_24_hour)) {
            var device_code = device.device_code
            promiseList.push( OccupantService.publishDeviceProperty(company_id, device_code, constant['global_time_format_24_hour'].setProperty, parseInt(global_time_format_24_hour), constant['global_time_format_24_hour'].property))
          } else if (device.type == "coordinator_device" && [1, 0, "1", "0"].includes(global_time_format_24_hour)) {
            var device_code = device.device_code
            promiseList.push(OccupantService.publishDeviceProperty(company_id, device_code, constant['global_time_format_24_hour_zc'].setProperty, parseInt(global_time_format_24_hour), constant["global_time_format_24_hour_zc"].property))
          }
        }
        if (promiseList.length > 0) {
          await Promise.all(promiseList).then((results) => {
            return results
          }).catch(error => {
            // const err = ErrorCodes['160033'];
            throw error;
          });
        }
      }
      
    }
    return {
      "message":"gateway setting updated"
    }
  }
}
export default DevicesService;
