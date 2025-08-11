import lodash, { } from 'lodash';
import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import jobsService from './JobsService';
import OccupantPermissionsService from './OccupantsPermissionsService';
import DeviceService from './DevicesService';
import sqsEmailProducer from '../../sqs/EmailQueueProducer';
import sqsNotificationProducer from '../../sqs/NotificationQueueProducer';
import cloudBridgeQueue from '../../sqs/CameraDeviceActionQueueProducer';

const { Op, QueryTypes } = database.Sequelize;

class OccupantsPermissionsMetadataService {
  static async addOccupantsPermissionsMetadata(key, value, occupant_permission_id, occupant_id, companyId, source_IP) {
    const occupantsPermissions = await database.occupants_permissions.findOne({
      where: { id: occupant_permission_id },
      include: [{
        model: database.devices,
        as:'gateway'
      }],
    }).then((result) => result).catch((e) => {
      console.log("🚀 ~ file: OccupantsPermissionsMetadataService.js:23 ~ OccupantsPermissionsMetadataService ~ addOccupantsPermissionsMetadata ~ e:", e)
      const err = ErrorCodes['160026'];
      throw err;
    });
    console.log("🚀 ~ file: OccupantsPermissionsMetadataService.js:22 ~ OccupantsPermissionsMetadataService ~ addOccupantsPermissionsMetadata ~ occupantsPermissions:", occupantsPermissions)
    if (occupantsPermissions) {
      if (occupant_id != occupantsPermissions.receiver_occupant_id) {
        const err = ErrorCodes['160045'];
        throw err;
      }
    } else {
      const err = ErrorCodes['160026'];
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
    if (key == 'geo_fencing_location_status') {
      const input = {
        gateway_code: occupantsPermissions.gateway.device_code,
        property_name: key,
        property_value: value,
        occupant_id,
        company_id: companyId,
        type: 'condition',
      }
      cloudBridgeQueue.sendProducer(input);
      const getMetaData = await database.devices_metadata.findOne({
        where: {
          key: 'auto_switch_status',
          device_id: occupantsPermissions.gateway_id,
        },
        raw: true,
      }).catch((err) => {
        throw (err);
      });
      if (getMetaData) {
        await this.setMyStatus(getMetaData.value, key, value, companyId,
          occupantsPermissions.gateway_id, OccupantsPermissionsMetadata)
          .catch((err) => {
            throw err;
          });
      }
    }
    if (key == 'geo_fencing_join_device_status') {
      const getMetaData = await database.devices_metadata.findOne({
        where: {
          key: 'auto_switch_status',
          device_id: occupantsPermissions.gateway_id,
        },
        raw: true,
      }).catch((err) => {
        throw (err);
      });
      if (getMetaData) {
        await this.manageMyStatus(getMetaData.value, companyId,
          occupantsPermissions.gateway_id)
          .catch((err) => {
            throw err;
          });
      }
    }

    return OccupantsPermissionsMetadata;
  }

  static async manageMyStatus(autoSwitchStatus, companyId, gatewayId) {
    const geofencingData = [];
    let joinDeviceStatus = 'false';
    const occupantsPermissionsIds = [];
    let status = 'away';
    const awayOccupantsPermissionsIds = [];
    const getOccupantsPermissions = await database.occupants_permissions.findAll({
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
      {
        model: await database.occupants_permissions_metadata,
        as: 'occupants_permissions_metadata',
        required: true,
        where: {
          [Op.or]: [
            { key: 'geo_fencing_location_status' },
            { key: 'geo_fencing_communication_config' },
            { key: 'geo_fencing_join_device_status' },
          ],
        },
      }],
      where: { gateway_id: gatewayId },
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160026'];
      throw err;
    });
    const geoFencingLocation = await Promise.all(getOccupantsPermissions.map(
      async (element) => {
        const key1 = element.occupants_permissions_metadata;
        return key1;
      },
    ));
    if (geoFencingLocation.length > 0) {
      if (geoFencingLocation) {
        geoFencingLocation.map((element) => {
          element.map((ele) => {
            const value1 = ele.value;
            if (value1 == 'home') {
              occupantsPermissionsIds.push(ele.occupant_permission_id);
            } else {
              awayOccupantsPermissionsIds.push(ele.occupant_permission_id);
            }
            geofencingData.push(value1);
            return null;
          });
          return null;
        });
      }
    }
    if (geofencingData.length > 0 && (geofencingData.includes('home') || geofencingData.includes('away'))) {
      let name = 'Away';
      if (geofencingData.includes('home')) {
        status = 'home';
        name = 'Home';
        const geofencingDeviceStatus = await database.occupants_permissions_metadata.findAll({
          where: {
            occupant_permission_id: {
              [Op.in]: occupantsPermissionsIds,
            },
            key: 'geo_fencing_join_device_status',
            value: 'true',
          },
          raw: true,
        }).then((result) => result).catch(() => {
          const err = ErrorCodes['160056'];
          throw err;
        });

        if (geofencingDeviceStatus.length > 0) {
          joinDeviceStatus = 'true';
        }
      }
      if (joinDeviceStatus == 'false') {
        status = 'away';
        name = 'Away';
        const geofencingDeviceStatus = await database.occupants_permissions_metadata.findAll({
          where: {
            occupant_permission_id: {
              [Op.in]: awayOccupantsPermissionsIds,
            },
            key: 'geo_fencing_join_device_status',
            value: 'true',
          },
          raw: true,
        }).then((result) => result).catch(() => {
          const err = ErrorCodes['160056'];
          throw err;
        });

        if (geofencingDeviceStatus.length > 0) {
          joinDeviceStatus = 'true';
        }
      }
      const ruleGroups = await database.rule_groups.findOne({
        where: {
          name,
          gateway_id: gatewayId,
        },
        include: [
          {
            attributes: ['id', 'device_code', 'model', 'type', 'rule_group_id'],
            model: database.devices,
            required: true,
          },
        ],
      }).catch((err) => {
        throw err;
      });
      if (joinDeviceStatus == 'true') {
        if (autoSwitchStatus == 'true') {
          if (ruleGroups && ruleGroups.id !== ruleGroups.device.rule_group_id) {
            const setMyStatus = ':sRule:SetMyStatus';
            await DeviceService.publishDeviceName(companyId, ruleGroups.device.device_code,
              setMyStatus, ruleGroups.key);
          }
        } else {
          await this.sendEmailOrNotification(getOccupantsPermissions, companyId, status);
        }
      }
    }
  }

  static async setMyStatus(autoSwitchStatus, key, value, companyId, gatewayId,
    OccupantsPermissionsMetadata) {
    let status = value;
    const geofencingData = [];
    let joinDeviceStatus = 'false';
    const occupantsPermissionsIds = [];
    OccupantsPermissionsMetadata.map((result) => {
      const ele = result.key;
      if (ele == 'geo_fencing_join_device_status') {
        joinDeviceStatus = result.value;
        return (joinDeviceStatus);
      }
    });
    if (joinDeviceStatus == 'true') {
      const getOccupantsPermissions = await database.occupants_permissions.findAll({
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
        {
          model: await database.occupants_permissions_metadata,
          as: 'occupants_permissions_metadata',
          required: true,
          where: {
            [Op.or]: [
              { key },
              { key: 'geo_fencing_communication_config' },
              { key: 'geo_fencing_join_device_status' },
            ],
          },
        },
        ],
        where: { gateway_id: gatewayId },
      }).then((result) => result).catch(() => {
        const err = ErrorCodes['160026'];
        throw err;
      });
      if (value == 'home') {
        const ruleGroups = await database.rule_groups.findOne({
          where: {
            name: 'Home',
            gateway_id: gatewayId,
          },
          include: [
            {
              attributes: ['id', 'device_code', 'name', 'model', 'type', 'rule_group_id'],
              model: database.devices,
              required: true,
            },
          ],
        }).catch((err) => {
          throw err;
        });
        if (autoSwitchStatus == 'true') {
          if (ruleGroups && ruleGroups.id !== ruleGroups.device.rule_group_id) {
            const setMyStatus = ':sRule:SetMyStatus';
            await DeviceService.publishDeviceName(companyId, ruleGroups.device.device_code,
              setMyStatus, ruleGroups.key);
          }
        } else {
          await this.sendEmailOrNotification(getOccupantsPermissions, companyId, status);
        }
      } else if (value == 'away') {
        const geoFencingLocation = await Promise.all(getOccupantsPermissions.map(
          async (element) => {
            const key1 = element.occupants_permissions_metadata;
            return key1;
          },
        ));
        if (geoFencingLocation.length > 0) {
          if (geoFencingLocation) {
            geoFencingLocation.map((element) => {
              element.map((ele) => {
                const value1 = ele.value;
                if (value1 == 'home') {
                  occupantsPermissionsIds.push(ele.occupant_permission_id);
                }
                geofencingData.push(value1);
                return null;
              });
              return null;
            });
          }
        }
        if (geofencingData.length > 0 && (geofencingData.includes('home') || geofencingData.includes('away'))) {
          if (geofencingData.includes('home')) {
            status = 'home';
            joinDeviceStatus = 'false';
            const geofencingDeviceStatus = await database.occupants_permissions_metadata.findAll({
              where: {
                occupant_permission_id: {
                  [Op.in]: occupantsPermissionsIds,
                },
                key: 'geo_fencing_join_device_status',
                value: 'true',
              },
              raw: true,
            }).then((result) => result).catch(() => {
              const err = ErrorCodes['160056'];
              throw err;
            });
            if (geofencingDeviceStatus.length > 0) {
              joinDeviceStatus = 'true';
            }
            const ruleGroups = await database.rule_groups.findOne({
              where: {
                name: 'Home',
                gateway_id: gatewayId,
              },
              include: [
                {
                  attributes: ['id', 'device_code', 'name', 'model', 'type', 'rule_group_id'],
                  model: database.devices,
                  required: true,
                },
              ],
            }).catch((err) => {
              throw err;
            });
            if (joinDeviceStatus == 'true') {
              if (autoSwitchStatus == 'true') {
                if (ruleGroups && ruleGroups.id !== ruleGroups.device.rule_group_id) {
                  const setMyStatus = ':sRule:SetMyStatus';
                  await DeviceService.publishDeviceName(companyId, ruleGroups.device.device_code,
                    setMyStatus, ruleGroups.key);
                }
              } else {
                await this.sendEmailOrNotification(getOccupantsPermissions, companyId, status);
              }
            }
          } else {
            const ruleGroups = await database.rule_groups.findOne({
              where: {
                name: 'Away',
                gateway_id: gatewayId,
              },
              include: [
                {
                  attributes: ['id', 'device_code', 'name', 'model', 'type', 'rule_group_id'],
                  model: database.devices,
                  required: true,
                },
              ],
            }).catch((err) => {
              throw err;
            });
            if (autoSwitchStatus == 'true') {
              if (ruleGroups && ruleGroups.id !== ruleGroups.device.rule_group_id) {
                const setMyStatus = ':sRule:SetMyStatus';
                await DeviceService.publishDeviceName(companyId, ruleGroups.device.device_code,
                  setMyStatus, ruleGroups.key);
              }
            } else {
              await this.sendEmailOrNotification(getOccupantsPermissions, companyId, status);
            }
          }
        }
      } else if (value == 'no_location') {
        const geoFencingLocation = await Promise.all(getOccupantsPermissions.map(
          async (element) => {
            const key1 = element.occupants_permissions_metadata;
            return key1;
          },
        ));
        if (geoFencingLocation.length > 0) {
          if (geoFencingLocation) {
            geoFencingLocation.map((element) => {
              element.map((ele) => {
                const value1 = ele.value;
                geofencingData.push(value1);
                return null;
              });
              return null;
            });
          }
        }
        if (geofencingData.length > 0 && (geofencingData.includes('home') || geofencingData.includes('no_location'))) {
          if (geofencingData.includes('home')) {
            status = 'home';
            joinDeviceStatus = 'false';
            const geofencingDeviceStatus = await database.occupants_permissions_metadata.findAll({
              where: {
                occupant_permission_id: {
                  [Op.in]: occupantsPermissionsIds,
                },
                key: 'geo_fencing_join_device_status',
                value: 'true',
              },
              raw: true,
            }).then((result) => result).catch(() => {
              const err = ErrorCodes['160056'];
              throw err;
            });
            if (geofencingDeviceStatus.length > 0) {
              joinDeviceStatus = 'true';
            }
            if (joinDeviceStatus == 'true') {
              const ruleGroups = await database.rule_groups.findOne({
                where: {
                  name: 'Home',
                  gateway_id: gatewayId,
                },
                include: [
                  {
                    attributes: ['id', 'device_code', 'name', 'model', 'type', 'rule_group_id'],
                    model: database.devices,
                    required: true,
                  },
                ],
              }).catch((err) => {
                throw err;
              });
              if (autoSwitchStatus == 'true') {
                if (ruleGroups && ruleGroups.id !== ruleGroups.device.rule_group_id) {
                  const setMyStatus = ':sRule:SetMyStatus';
                  await DeviceService.publishDeviceName(companyId, ruleGroups.device.device_code,
                    setMyStatus, ruleGroups.key);
                }
              } else {
                await this.sendEmailOrNotification(getOccupantsPermissions, companyId, status);
              }
            }
          } else {
            const ruleGroups = await database.rule_groups.findOne({
              where: {
                name: 'Away',
                gateway_id: gatewayId,
              },
              include: [
                {
                  attributes: ['id', 'device_code', 'name', 'model', 'type', 'rule_group_id'],
                  model: database.devices,
                  required: true,
                },
              ],
            }).catch((err) => {
              throw err;
            });
            if (autoSwitchStatus == 'true') {
              if (ruleGroups && ruleGroups.id !== ruleGroups.device.rule_group_id) {
                const setMyStatus = ':sRule:SetMyStatus';
                await DeviceService.publishDeviceName(companyId, ruleGroups.device.device_code,
                  setMyStatus, ruleGroups.key);
              }
            } else {
              await this.sendEmailOrNotification(getOccupantsPermissions, companyId, status);
            }
          }
        }
      }
    }
  }

  static async sendEmailOrNotification(OccupantsPermissions, companyId, status) {
    await Promise.all(OccupantsPermissions.map(async (data) => {
      let occupantsPermissionsMetadata = data.occupants_permissions_metadata;
      const occupantsPermissionsMetadataKey = lodash.map(occupantsPermissionsMetadata, 'key');
      let joinDeviceStatus = 'false';
      if (occupantsPermissionsMetadataKey.includes('geo_fencing_join_device_status')) {
        occupantsPermissionsMetadata.filter((obj) => {
          if (obj.key == 'geo_fencing_join_device_status') {
            joinDeviceStatus = obj.value;
            return (joinDeviceStatus);
          }
        });
      }
      if (joinDeviceStatus == 'true') {
        if (occupantsPermissionsMetadataKey.includes('geo_fencing_location_status') && occupantsPermissionsMetadataKey.includes('geo_fencing_communication_config')) {
          occupantsPermissionsMetadata = occupantsPermissionsMetadata.filter((obj) => {
            if (obj.key == 'geo_fencing_communication_config') {
              return obj;
            }
          });
          if (occupantsPermissionsMetadata.length > 0) {
            occupantsPermissionsMetadata = occupantsPermissionsMetadata[0];
            const communicationConfig = JSON.parse(occupantsPermissionsMetadata.value);
            if (communicationConfig) {
              if (communicationConfig.email_enabled == true) {
                const obj = {};
                const occupant = await this.getOccupant(data.receiver_occupant_id).catch((err) => {
                  throw err;
                });
                const email = {
                  email: occupant.occupantsData.email,
                };
                if (status == 'home') {
                  obj.key = Entities.geofense_alert.event_name.home;
                } else if (status == 'away' || status == 'no_location') {
                  obj.key = Entities.geofense_alert.event_name.away;
                }
                obj.type = 'geofence';
                obj.receiverList = [email];
                obj.language = occupant.language;
                obj.user_name = occupant.user_name;
                obj.first_last_name = occupant.first_last_name;
                obj.company_id = companyId;
                obj.message = communicationConfig.message;
                // send obj to EmailQueue
                sqsEmailProducer.sendProducer(obj);
              }
              if (communicationConfig.notification_enabled == true) {
                const obj = {};
                const occupant = await this.getOccupant(data.receiver_occupant_id).catch((err) => {
                  throw err;
                });
                let notificationTokenLists = [];
                const notificationToken = await
                this.getUserNotificationTokens(data.receiver_occupant_id)
                  .then((result) => (result))
                  .catch((err) => {
                    throw (err);
                  });
                if (notificationToken && notificationToken.length > 0) {
                  notificationTokenLists = lodash.map(notificationToken, 'token');
                  if (status == 'home') {
                    obj.key = Entities.geofense_alert.event_name.home;
                  } else if (status == 'away' || status == 'no_location') {
                    obj.key = Entities.geofense_alert.event_name.away;
                  }
                  obj.type = 'geofence';
                  obj.notificationTokenList = notificationTokenLists;
                  obj.language = occupant.language;
                  obj.user_name = occupant.user_name;
                  obj.first_last_name = occupant.first_last_name;
                  obj.company_id = companyId;
                  obj.message = communicationConfig.message;
                  // send obj to NotificationQueue
                  sqsNotificationProducer.sendProducer(obj);
                }
              }
            }
          }
        }
      }
    }));
  }

  static async getUserNotificationTokens(occupantId) {
    const userNotificationTokens = await database.occupants_notification_tokens.findAll({
      where: {
        occupant_id: occupantId,
      },
    }).then((result) => (result)).catch((err) => {
      throw (err);
    });
    return userNotificationTokens;
  }

  static async getOccupant(id) {
    let language = null;
    let user_name = null;
    let first_last_name = null;
    const occupantsData = await database.occupants.findOne({
      where: {
        id,
      },
    }).then((result) => result).catch((err) => {
      throw (err);
    });
      /// // assigning new language_enabled variable from placeholders_data
    if (occupantsData && occupantsData.language != null) {
      language = occupantsData.language;
    } else {
      language = Entities.default_language.event_name.default;
      // first_last_name = (deleteOccFirstLastName && deleteOccFirstLastName != null)? deleteOccFirstLastName: where.email;
    }
    if (occupantsData) {
      if (occupantsData.first_name != null) {
        user_name = occupantsData.first_name;
        first_last_name = `${occupantsData.first_name} ${occupantsData.last_name}`;
      } else {
        user_name = occupantsData.email;
        first_last_name = occupantsData.email;
      }
    }
    return ({
      occupantsData, language, user_name, first_last_name,
    });
  }

  static async getOccupantsPermissionsMetadata(occupant_permission_id, occupant_id) {
    const occupantsPermissions = await
    OccupantPermissionsService.getDataOccupantsPermissions(occupant_permission_id)
      .then((result) => result).catch(() => {
        const err = ErrorCodes['160056'];
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

  static async disableGeofencing(occupant_permission_id, occupant_id, companyId, gateway_id) {
    const checkGatewayIdExists = await database.devices.findOne({
      where: { id: gateway_id },
    });
    if (!checkGatewayIdExists) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    const occupantsPermissions = await database.occupants_permissions.findOne({
      where: {
        receiver_occupant_id: occupant_id,
        gateway_id,
      },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160026'];
      throw err;
    });
    if (occupantsPermissions) {
      if (occupantsPermissions.id == occupant_permission_id) {
        const err = ErrorCodes['160060'];
        throw err;
      }
      if (occupantsPermissions.access_level != 'O') {
        const err = ErrorCodes['160045'];
        throw err;
      }
    } else {
      const err = ErrorCodes['160026'];
      throw err;
    }

    const deleteOccupantsPermissions = await database.occupants_permissions.findOne({
      where: {
        id: occupant_permission_id,
        gateway_id,
      },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160026'];
      throw err;
    });
    if (!deleteOccupantsPermissions) {
      const err = ErrorCodes['160061'];
      throw err;
    }
    const getOccupantsPermissionsMetadata = await database.occupants_permissions_metadata.findAll({
      where: {
        occupant_permission_id,
      },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160026'];
      throw err;
    });
    const OccupantsPermissionsMetadata = await database.occupants_permissions_metadata.destroy({
      where: {
        occupant_permission_id,
        key: {
          [Op.iLike]: '%geo%',
        },
      },
    }).then((result) => (result)).catch(() => {
      const err = ErrorCodes['160058'];
      throw err;
    });
    const DeletedOccupantsPermissionsMetadata = await
    database.occupants_permissions_metadata.findAll({
      where: {
        occupant_permission_id,
      },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160026'];
      throw err;
    });
    const obj = {
      old: getOccupantsPermissionsMetadata,
      new: DeletedOccupantsPermissionsMetadata,
    };
    ActivityLogs.addActivityLog(Entities.occupants_permissions_metadata.entity_name,
      Entities.occupants_permissions_metadata.event_name.deleted,
      obj, Entities.notes.event_name.deleted, occupant_permission_id,
      companyId, null, occupant_id);
    return OccupantsPermissionsMetadata;
  }
}

export default OccupantsPermissionsMetadataService;
