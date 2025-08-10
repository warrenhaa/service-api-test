import lodash from 'lodash';
import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import { DPCommands } from '../../utils/constants/DeviceProvisionCommands';
import DeviceProvisionService from './DeviceProvisionService';
import OccupantsDashboardAttributesService from './OccupantsDashboardAttributesService';
import OccupantsGroupsService from './OccupantsGroupsService';
import cameraDeviceActionQueue from '../../sqs/CameraDeviceActionQueueProducer';
import { getCompany } from '../../cache/Companies';
import jobsService from './JobsService';
const { Op, QueryTypes } = database.Sequelize;
const moment = require('moment');
import UserService from './UsersService';
class OccupantsPermissionsService {
  static async getDataOccupantsPermissions(id) {
    const getDataOccupantsPermissions = await database.occupants_permissions.findOne({
      where: { id },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160026'];
      throw err;
    });
    return getDataOccupantsPermissions;
  }

  static async getAllDevicesOfGateway(gateway_id) {
    const getAllDevicesOfGateways = await database.devices.findAll({
      where: {
        gateway_id,
      },
    }).then((result) => {
      const deviceIdLists = [];
      if (result && result.length > 0) {
        for (const element in result) {
          const data = result[element];
          deviceIdLists.push(data.id);
        }
      }
      return (deviceIdLists);
    }).catch((error) => {
      const err = ErrorCodes['800002'];
      throw err;
    });
    return getAllDevicesOfGateways;
  }

  static async getlinkedCompanies(company_id) {
    // get company data from cache if not present set
    const company = await getCompany(company_id).then(result => {
      return (result);
    }).catch((error) => {
      throw (error);
    });
    if (!company) {
      const err = ErrorCodes['000001'];
      throw (err);
    }
    let linkedCompanies = [];
    if (company.linked_companies) {
      linkedCompanies = company.linked_companies.split(',');
    }
    linkedCompanies.push(company.code);
    const companies = await database.companies.findAll({
      where: { code: { [Op.in]: linkedCompanies } },
    });
    linkedCompanies = lodash.map(companies, 'id');
    return linkedCompanies;
  }

  static async getOccupantsPermissions(gateway_id, companyid, occupant_id, gateway_code, user_id) {
    let where = {};
    let gateway_where = {}
    const linkedCompanies = await this.getlinkedCompanies(companyid)
      .catch((error) => {
        throw (error);
      });
    if (gateway_code) {
      gateway_where = { device_code: gateway_code }
    }
    else {
      gateway_where = { id: gateway_id }
    }
    if (!user_id && occupant_id) {
      const isHavePermission = await database.occupants_permissions.findOne({
        where: {
          [Op.or]: [
            {
              receiver_occupant_id: occupant_id,
              is_temp_access: false,
              gateway_id,
            },
            {
              receiver_occupant_id: occupant_id,
              end_time: {
                [Op.gte]: moment().toDate(),
              },
              start_time: {
                [Op.lte]: moment().toDate(),
              },
              is_temp_access: true,
              gateway_id,
            }],
        },
      });
      if (!isHavePermission) {
        const err = ErrorCodes['160045'];
        throw err;
      }
    }
    const checkGatewayIdExists = await database.devices.findOne({
      where: gateway_where,
    });
    if (!checkGatewayIdExists) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    where = { gateway_id: checkGatewayIdExists.id, company_id: { [Op.in]: linkedCompanies } };

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
        attributes: ['id', 'name', 'model', 'device_code', 'type'],
        model: database.devices,
        as: 'gateway',
        include: [
          {
            model: database.camera_devices,
            required: false,
          },
        ],
      },
      {
        model: database.occupants_permissions_metadata,
        as: 'occupants_permissions_metadata',
        required: false,
      },
      {
        model: database.occupants_camera_permissions,
        as: 'camera_permissions',
        include: [
          {
            model: database.camera_devices,
            required: false,
          },
        ],
      }
      ],
      where,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160026'];
      throw err;
    });
    // initialize the array to store the formatted occupant_permissions data
    let finalOccupantsPermssions = []

    if (getOccupantsPermissions && getOccupantsPermissions.length >= 1) {
      for (const attri of getOccupantsPermissions) {
        let cameraDevices = [];
        var ele = attri;
        if (attri.receiver_occupant_id == attri.sharer_occupant_id) { //owner
          cameraDevices = attri.gateway.camera_devices;
        } else { //sharer
          for (let index = 0; index < attri.camera_permissions.length; index++) {
            const element = attri.camera_permissions[index];
            cameraDevices.push(element.camera_device)
          }
        }
        delete ele.gateway.dataValues.camera_devices;
        delete ele.dataValues.camera_permissions;

        ele.dataValues["camera_permissions"] = cameraDevices;
        finalOccupantsPermssions.push(ele);
      }
    }
    // returning the formatted occupant_permissions
    return finalOccupantsPermssions;
  }

  static async addOccupantsPermission(body) {
    const addOccupantsPermissions = await database.occupants_permissions.create({
      sharer_occupant_id: body.sharer_occupant_id,
      gateway_id: body.gateway_id,
      receiver_occupant_id: body.receiver_occupant_id,
      invitation_email: body.invitation_email,
      user_id: body.user_id || null,
      company_id: body.company_id,
      start_time: body.startTime || null,
      end_time: body.endTime || null,
      is_temp_access: body.is_temp_access,
      access_level: body.access_level,
    }).then((result) => result).catch((error) => {
      const err = ErrorCodes['160036'];
      throw err;
    });
    const device = await database.devices.findOne({ where: { id: body.gateway_id } });
    addOccupantsPermissions.dataValues.UserEmail = body.invitation_email;
    addOccupantsPermissions.dataValues.GatewayID = device.device_code;
    const Obj = {
      old: {},
      new: addOccupantsPermissions,
    };
    if (addOccupantsPermissions) {
      ActivityLogs.addActivityLog(Entities.occupants_permissions.entity_name, Entities.occupants_permissions.event_name.added,
        Obj, Entities.notes.event_name.added, body.receiver_occupant_id, body.company_id, null, body.receiver_occupant_id, null);
    }
    return addOccupantsPermissions;
  }

  static async addOccupantsPermissions(body, companyid, occupant_id, accessToken, identity_id, request_id) {
    let receiver_occupant_id = null;
    let sharer_occupant_id = null;
    let receiver_occupant = null;
    let startTime = null;
    let endTime = null;
    let occupant_permission_id = null;
    const { camera_device_id_list } = body;
    if (body.invitation_email) {
      body.invitation_email = body.invitation_email.toLowerCase();
    }
    // if need to share camera devices
    if (body.gateway_id) {
      const gateway = await database.devices.findOne({
        where: { id: body.gateway_id },
        raw: true,
      }).then((result) => result);
      if (!gateway) {
        const err = ErrorCodes['800013'];
        throw err;
      }
      if (body.invitation_email) {
        receiver_occupant = await database.occupants.findOne({
          where:
          {
            email: body.invitation_email,
          },
        }).catch((error) => {
          const err = ErrorCodes['160036'];
          throw err;
        });
        if (receiver_occupant) {
          receiver_occupant_id = receiver_occupant.id;
          const permissionExist = await database.occupants_permissions.findOne({
            where: {
              receiver_occupant_id,
              gateway_id: body.gateway_id,
            },
          });
          if (permissionExist) {
            const err = ErrorCodes['160044'];
            throw err;
          }
        } else {
          const permissionExist = await database.occupants_permissions.findOne({
            where: {
              invitation_email: body.invitation_email,
              gateway_id: body.gateway_id,
            },
          });

          if (permissionExist) {
            const err = ErrorCodes['160044'];
            throw err;
          }
        }
      } // end of body.invitation_email
      const isHavePermission = await database.occupants_permissions.findOne({
        where: {
          receiver_occupant_id: occupant_id,
          gateway_id: body.gateway_id,
          access_level: 'O',
        },
      });
      if (!isHavePermission) {
        const err = ErrorCodes['160045'];
        throw err;
      }

      if (body.is_temp_access === true) {
        startTime = body.start_time;
        endTime = body.end_time;
      }

      if (accessToken && receiver_occupant) {
        const headerParams = {
          Authorization: accessToken,
        };
        const deviceFormObj = {
          UserID: identity_id,
          Username: receiver_occupant.email,
          Command: DPCommands.share,
          DeviceID: gateway.device_code,
        };
        await DeviceProvisionService.deviceProvison(headerParams, deviceFormObj, 0)
          .then((result) => {
            const { data } = result;
            if (data.errorMessage) {
              const err = ErrorCodes['380001'];
              throw err;
            } else if (data.statusCode != 200) {
              const err = ErrorCodes['380001'];
              err.message = data.body;
              throw err;
            }
          })
          .catch((error) => {
            const err = ErrorCodes['380001'];
            throw err;
          });
      }

      const addOccupantsPermissions = await database.occupants_permissions.create({
        sharer_occupant_id: occupant_id,
        gateway_id: body.gateway_id,
        receiver_occupant_id,
        invitation_email: body.invitation_email,
        user_id: body.user_id,
        company_id: companyid,
        start_time: startTime,
        end_time: endTime,
        is_temp_access: body.is_temp_access,
        access_level: body.access_level,
      }).then(async (result) => {
        let getOccupantPermissions = null;
        if (result) {
          occupant_permission_id = result.id;
          getOccupantPermissions = await database.occupants_permissions.findOne({
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
              id: result.id,
            },
          }).then((res) => res).catch((error) => {
            const err = ErrorCodes['160046'];
            throw err;
          });

        }
        return getOccupantPermissions;
      }).catch((error) => {
        const err = ErrorCodes['160036'];
        throw err;
      });
      if (receiver_occupant_id) {
        const data = {
          item_id: body.gateway_id,
          type: 'gateway',
          grid_order: await OccupantsGroupsService.getRandomGridOrder(),
        };
        await OccupantsDashboardAttributesService.AddorUpdateOccupantsDashboardAttributes(data,
          body.company_id, receiver_occupant_id);

        let input = {
          gateway_id: body.gateway_id,
          company_id: body.company_id,
          receiver_occupant_id: receiver_occupant_id
        }
        await jobsService.createJob('occupantsGatewayDashboardAttributesJob', input, body.company_id, null, null, null, request_id)
          .then(async (resp) => resp)
          .catch((err) => {
            throw (err);
          });
      }

      sharer_occupant_id = identity_id;
      // after record creation create record for occupants_camera_permissions
      if (camera_device_id_list && camera_device_id_list.length > 0) {
        for (const key in camera_device_id_list) {
          const camera_device_id = camera_device_id_list[key];
          // check camera_device_id is present in camera_devices table
          const cameraDeviceExist = await database.camera_devices.findOne({
            where: { id: camera_device_id },
            raw: true,
          }).then((result) => result)
            .catch((error) => {
              const err = ErrorCodes['470005'];
              throw err;
            });

          if (!cameraDeviceExist) {
            const err = ErrorCodes['470005'];
            throw err;
          }
          // check camera_device_id is present in camera_devices table
          const cameraPermissionExist = await database.occupants_camera_permissions.findOne({
            where: { camera_device_id, occupant_permission_id, },
          });

          if (!cameraPermissionExist || cameraPermissionExist == null) {
            // adding record in OCP's.
            const addOccupantsCameraPermissions = await database.occupants_camera_permissions.create({
              camera_device_id,
              occupant_permission_id: occupant_permission_id,
              company_id: companyid,
              access_level: body.access_level,
            }).then((result) => {
              return result;
            }).catch((error) => {
              const err = ErrorCodes['470004'];
              throw err;
            });
            // add activitylog
            const obj = {
              old: {},
              new: addOccupantsCameraPermissions,
            };
            if (addOccupantsCameraPermissions) {
              ActivityLogs.addActivityLog(Entities.camera_occupants_permissions.entity_name, Entities.camera_occupants_permissions.event_name.added,
                obj, Entities.notes.event_name.added, occupant_id, companyid, body.user_id, occupant_id, null);
            }
            // if occupant is registered then add object in action queue
            if (receiver_occupant) {
              const data = {
                occupant_id: sharer_occupant_id,
                camera_id: cameraDeviceExist.camera_id,
                action: {
                  type: 'access',
                  event: 'share',
                  value: receiver_occupant.identity_id,
                },
                time: moment(new Date()).utc().format('DD-MM-YYYY'),
              };
              // send this object in action queue
              cameraDeviceActionQueue.sendProducer(data);
            }
          } // end of no camera permission
        } // end for
      } // end if
      const Obj = {
        old: {},
        new: addOccupantsPermissions,
      };
      const email = body.invitation_email;
      let userName = body.invitation_email;
      const findInvitationEmail = await database.occupants.findOne({
        where: { email: body.invitation_email },
      }).then((result) => {
        if (result && result.first_name) {
          userName = result.first_name;
        }
      });
      const placeholdersData = {
        gateway_name: gateway.name || gateway.device_code,
        email,
        user_name: userName,
        receiverList: [{ email }],
      };
      if (addOccupantsPermissions) {
        ActivityLogs.addActivityLog(Entities.occupants_permissions.entity_name, Entities.occupants_permissions.event_name.added,
          Obj, Entities.notes.event_name.added, occupant_id, companyid, body.user_id, occupant_id, placeholdersData);
      }
      return addOccupantsPermissions;
    }
  }

  static async updateOccupantsPermissions(id, body, occupant_id, companyId) {
    const oldObj = {};
    const newObj = {};
    const { camera_device_id_list } = body;
    if (body.invitation_email) {
      body.invitation_email = body.invitation_email.toLowerCase();
    }
    const existingData = await this.getDataOccupantsPermissions(id);
    let afterUpdate = null;

    if (!existingData) {
      const err = ErrorCodes['160026'];
      throw err;
    }

    const updatedData = await database.occupants_permissions.update(body, {
      where: { id },
      returning: true,
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160039'];
      throw err;
    });
    afterUpdate = await this.getDataOccupantsPermissions(id).then((result) => result).catch(() => {
      const err = ErrorCodes['160027'];
      throw err;
    });
    const { receiver_occupant_id } = afterUpdate;
    const { sharer_occupant_id } = afterUpdate;
    const getReceiverOccupant = await database.occupants.findOne({
      where: { id: receiver_occupant_id },
    }).then((result) => {
      return result;
    }).catch((error) => {
      throw error;
    });
    const getSharerOccupant = await database.occupants.findOne({
      where: { id: sharer_occupant_id },
    }).then((result) => {
      return result;
    }).catch((error) => {
      throw error;
    });

    Object.keys(body).forEach((key) => {
      if (JSON.stringify(existingData[key]) !== JSON.stringify(body[key])) {
        oldObj[key] = existingData[key];
        newObj[key] = body[key];
      }
    });
    const obj = {
      old: oldObj,
      new: newObj,
    };
    const deletedExistingData = { ...existingData };
    delete deletedExistingData.updated_at;

    const deletedAfterUpdate = { ...afterUpdate };
    delete deletedAfterUpdate.updated_at;
    const email = existingData.invitation_email;

    let userName = existingData.invitation_email;
    const findInvitationEmail = await database.occupants.findOne({
      where: { email: existingData.invitation_email },
    }).then((result) => {
      if (result && result.first_name) {
        userName = result.first_name;
      }
    });
    if (existingData.gateway_id) {
      const gateway = await database.devices.findOne({
        where: { id: existingData.gateway_id },
        raw: true,
      }).then((result) => result);
      if (!gateway) {
        const err = ErrorCodes['800013'];
        throw err;
      }
      const placeholdersData = {
        gateway_name: gateway.name || gateway.device_code,
        email,
        user_name: userName,
        receiverList: [{ email }],
      };
      if (JSON.stringify(deletedExistingData) !== JSON.stringify(deletedAfterUpdate)) {
        if (oldObj.welcome_tile_enabled == newObj.welcome_tile_enabled) {
          ActivityLogs.addActivityLog(Entities.occupants_permissions.entity_name, Entities.occupants_permissions.event_name.updated,
            obj, Entities.notes.event_name.updated, occupant_id, companyId, body.user_id, occupant_id, placeholdersData);
        } else {
          ActivityLogs.addActivityLog(Entities.occupants_permissions.entity_name, Entities.occupants_permissions.event_name.welcome_tile_updated,
            obj, Entities.notes.event_name.updated, occupant_id, companyId, body.user_id, occupant_id, placeholdersData);
        }
      }
    }
    // i doubt need to put only if gateway_id has in existing data
    // get the present occperid assigned camera_device_id list
    if (camera_device_id_list && camera_device_id_list.length > 0) {
      const getOccupant = await database.occupants.findOne({
        where: { id: receiver_occupant_id },
      }).then((result) => {
        return result;
      }).catch((error) => {
        throw error;
      });
      // find all records where the opi is there.
      const getAllOccPerIdCameraRecords = await database.occupants_camera_permissions.findAll({
        where: {
          occupant_permission_id: id,
        },
      }).then((result) => {
        return result;
      }).catch((error) => {
        const err = ErrorCodes['470008'];
        throw err;
      });

      if (getAllOccPerIdCameraRecords && getAllOccPerIdCameraRecords.length > 0) {
        for (const key in getAllOccPerIdCameraRecords) {
          const singleRecord = getAllOccPerIdCameraRecords[key];
          const existing_camera_device_id = singleRecord.camera_device_id;
          // check existing id is still present in update array
          if (!camera_device_id_list.includes(existing_camera_device_id)) {
            const deletedData = await database.occupants_camera_permissions.destroy({
              where: {
                occupant_permission_id: id, camera_device_id: existing_camera_device_id,
              },
            }).then((result) => { return result }).catch((error) => {
              const err = ErrorCodes['470007'];
              throw err;
            });
            // unshared occupant id put in a action queue
            if (getOccupant) {
              // find the camera divices record fr deleting camdevid
              const cameraDeviceExist = await database.camera_devices.findOne({
                where: { id: existing_camera_device_id },
                raw: true,
              }).then((result) => result)
                .catch((error) => {
                  const err = ErrorCodes['470005'];
                  throw err;
                });

              if (cameraDeviceExist) {
                // if occupant present then put in a action queue
                const data = {
                  occupant_id: getSharerOccupant.identity_id,
                  camera_id: cameraDeviceExist.camera_id,
                  action: {
                    type: 'access',
                    event: 'unshare',
                    value: getReceiverOccupant.identity_id,
                  },
                  time: moment(new Date()).utc().format('DD-MM-YYYY'),
                }
                // send this object in action queue
                cameraDeviceActionQueue.sendProducer(data);
              }
            }
          } // end not include if
        } // end for
      } // end if

      // now update the record of OccCamPer for the extra records if present in array
      for (const key in camera_device_id_list) {
        const updating_camera_device_id = camera_device_id_list[key];
        // check that camera device id exists or not
        const cameraDeviceExist = await database.camera_devices.findOne({
          where: { id: updating_camera_device_id },
          raw: true,
        }).then((result) => result)
          .catch((error) => {
            const err = ErrorCodes['470005'];
            throw err;
          });

        if (!cameraDeviceExist) {
          const err = ErrorCodes['470005'];
          throw err;
        }
        // check occcamper has the record
        const cameraPermissionExist = await database.occupants_camera_permissions.findOne({
          where: { camera_device_id: updating_camera_device_id, occupant_permission_id: id },
        });

        if (!cameraPermissionExist) {
          // create new record in OCP's
          const addOccupantsCameraPermissions = await database.occupants_camera_permissions.create({
            camera_device_id: updating_camera_device_id,
            occupant_permission_id: id,
            company_id: companyId,
            access_level: afterUpdate.access_level,
          }).then((result) => {
            return result;
          }).catch((error) => {
            const err = ErrorCodes['470004'];
            throw err;
          });
          // add activitylog
          const obj = {
            old: {},
            new: addOccupantsCameraPermissions,
          };
          if (addOccupantsCameraPermissions) {
            ActivityLogs.addActivityLog(Entities.camera_occupants_permissions.entity_name, Entities.camera_occupants_permissions.event_name.added,
              obj, Entities.notes.event_name.added, occupant_id, companyId, body.user_id, occupant_id, null);
          }
          // shared occupant id put in a action queue
          if (getOccupant) {
            // if occupant present then put in a action queue
            const data = {
              occupant_id: getSharerOccupant.identity_id,
              camera_id: cameraDeviceExist.camera_id,
              action: {
                type: 'access',
                event: 'share',
                value: getReceiverOccupant.identity_id,
              },
              time: moment(new Date()).utc().format('DD-MM-YYYY'),
            };
            // send this object in action queue
            cameraDeviceActionQueue.sendProducer(data);
          }
        }// end of cameraper not exist
      } // end for
    } else {
      const getOccupant = await database.occupants.findOne({
        where: { id: receiver_occupant_id },
      }).then((result) => {
        return result;
      }).catch((error) => {
        throw error;
      });
      // find all records where the opi is there.
      const getAllOccPerIdCameraRecords = await database.occupants_camera_permissions.findAll({
        where: {
          occupant_permission_id: id,
        },
      }).then((result) => {
        return result;
      }).catch((error) => {
        const err = ErrorCodes['470008'];
        throw err;
      });

      if (getAllOccPerIdCameraRecords && getAllOccPerIdCameraRecords.length > 0) {
        for (const key in getAllOccPerIdCameraRecords) {
          const singleRecord = getAllOccPerIdCameraRecords[key];
          const existing_camera_device_id = singleRecord.camera_device_id;
          const deletedData = await database.occupants_camera_permissions.destroy({
            where: {
              occupant_permission_id: id, camera_device_id: existing_camera_device_id,
            },
          }).then((result) => { return result }).catch((error) => {
            const err = ErrorCodes['470007'];
            throw err;
          });
          // unshared occupant id put in a action queue
          if (getOccupant) {
            // find the camera divices record fr deleting camdevid
            const cameraDeviceExist = await database.camera_devices.findOne({
              where: { id: existing_camera_device_id },
              raw: true,
            }).then((result) => result)
              .catch((error) => {
                const err = ErrorCodes['470005'];
                throw err;
              });

            if (cameraDeviceExist) {
              // if occupant present then put in a action queue
              const data = {
                occupant_id: getSharerOccupant.identity_id,
                camera_id: cameraDeviceExist.camera_id,
                action: {
                  type: 'access',
                  event: 'unshare',
                  value: getReceiverOccupant.identity_id,
                },
                time: moment(new Date()).utc().format('DD-MM-YYYY'),
              }
              // send this object in action queue
              cameraDeviceActionQueue.sendProducer(data);
            }
          }
        } // end for
      }
    }
    return afterUpdate;
  }

  static async resendOccupantsPermissions(id, occupant_id, company_id) {
    const linkedCompanies = await this.getlinkedCompanies(company_id)
      .catch((error) => {
        throw (error);
      });
    const getOccupantsPermissions = await database.occupants_permissions.findOne({
      where: { id, company_id: { [Op.in]: linkedCompanies } },
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160027'];
      throw err;
    });
    if (!getOccupantsPermissions) {
      const err = ErrorCodes['160027'];
      throw err;
    }
    const email = getOccupantsPermissions.invitation_email;
    let userName = getOccupantsPermissions.invitation_email;
    const findInvitationEmail = await database.occupants.findOne({
      where: { email: getOccupantsPermissions.invitation_email },
    }).then((result) => {
      if (result && result.first_name) {
        userName = result.first_name;
      }
    });
    const obj = {
      old: getOccupantsPermissions,
      new: {},
    };
    if (getOccupantsPermissions.gateway_id) {
      const gateway = await database.devices.findOne({
        where: { id: getOccupantsPermissions.gateway_id },
        raw: true,
      }).then((result) => result);
      if (!gateway) {
        const err = ErrorCodes['800013'];
        throw err;
      }
      const placeholdersData = {
        gateway_name: gateway.name || gateway.device_code,
        email,
        user_name: userName,
        receiverList: [{ email }],
      };
      ActivityLogs.addActivityLog(Entities.occupants_permissions.entity_name, Entities.occupants_permissions.event_name.resend,
        obj, Entities.notes.event_name.updated, occupant_id, company_id, null, occupant_id, placeholdersData);
    }
    return getOccupantsPermissions;
  }

  static async deleteOccupantsDashboardAttributes(data, company_id) {
    const deleteData = await database.occupants_dashboard_attributes.findOne({
      attributes: ['id', 'type', 'grid_order'],
      where: {
        item_id: data.item_id,
        occupant_id: data.occupant_id,
        type: data.type,
      },
    }).catch((error) => {
      const err = ErrorCodes['160025'];
      throw err;
    });
    if (deleteData) {
      const deletedData = await database.occupants_dashboard_attributes.destroy({
        where: {
          id: deleteData.id,
        },
      }).then((result) => result).catch((error) => {
        const err = ErrorCodes['160041'];
        throw err;
      });
      const obj = {
        old: deleteData,
        new: {},
      };
      ActivityLogs.addActivityLog(Entities.occupants_dashboard_attributes.entity_name,
        Entities.occupants_dashboard_attributes.event_name.deleted, obj,
        Entities.notes.event_name.deleted, data.occupant_id, company_id,
        null, data.occupant_id, null);
      return deletedData;
    }
    return null;
  }

  static async deleteOccupantsPermissions(id, occupant_id, companyId, accessToken, identity_id, Command, occupant_email, calledByAPI) {
    const deleteOccupantsPermissions = await database.occupants_permissions.findOne({
      where: { id },
      include: [{
        model: database.occupants,
        as: 'receiver_occupant',
      }, {
        model: database.occupants,
        as: 'sharer_occupant',
      }, {
        model: database.devices,
        as: 'gateway',
      }],
    });
    if (!deleteOccupantsPermissions) {
      const err = ErrorCodes['160027'];
      throw err;
    }
    const adminEmail = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const reqObj = {
      body: {
        company_id: companyId,
      },
    };
    const AdminData = await UserService.cognitoLogin(reqObj, adminEmail, password);
    let isActualOwner = false
    if (calledByAPI == true && deleteOccupantsPermissions.receiver_occupant_id == deleteOccupantsPermissions.sharer_occupant_id) {
      isActualOwner = true
      if (deleteOccupantsPermissions.receiver_occupant_id !== occupant_id) {
        const err = ErrorCodes['160045'];
        throw err;
      }
      if (deleteOccupantsPermissions.receiver_occupant_id == occupant_id) {
        const err = ErrorCodes['160045'];
        throw err;
      }
    }

    if (accessToken && deleteOccupantsPermissions.receiver_occupant && deleteOccupantsPermissions.gateway) {
      if (AdminData.identityId != identity_id && deleteOccupantsPermissions.receiver_occupant_id == occupant_id && Command != DPCommands.adminunshare) {
        Command = DPCommands.unRegisterOwner;
      }
      const headerParams = {
        Authorization: accessToken,
      };
      const deviceFormObj = {
        UserID: identity_id,
        Username: deleteOccupantsPermissions.receiver_occupant.email,
        Command,
        DeviceID: deleteOccupantsPermissions.gateway.device_code,
      };
      await DeviceProvisionService.deviceProvison(headerParams, deviceFormObj, 0)
        .then((result) => {
          const { data } = result;
          if (data.errorMessage) {
            const err = ErrorCodes['380001'];
            throw err;
          } else if (data.statusCode != 200) {
            const err = ErrorCodes['380001'];
            err.message = data.body;
            throw err;
          }
        })
        .catch((error) => {
          const err = ErrorCodes['380001'];
          throw err;
        });
    }

    // find all records where the opi is there.
    const getAllOccPerIdCameraRecords = await database.occupants_camera_permissions.findAll({
      where: {
        occupant_permission_id: id,
      },
    }).then((result) => {
      return result;
    }).catch((error) => {
      const err = ErrorCodes['470008'];
      throw err;
    });
    const deletedData = await database.occupants_permissions.destroy({
      where: { id },
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160028'];
      throw err;
    });
    if (deleteOccupantsPermissions.receiver_occupant && getAllOccPerIdCameraRecords && getAllOccPerIdCameraRecords.length > 0) {
      const receiver_occupant_id = deleteOccupantsPermissions.receiver_occupant.identity_id;
      const sharer_occupant_id = identity_id;
      for (const key in getAllOccPerIdCameraRecords) {
        const singleOCcCamPer = getAllOccPerIdCameraRecords[key];
        const single_cam_dev_id = singleOCcCamPer.camera_device_id;
        const cameraDeviceExist = await database.camera_devices.findOne({
          where: { id: single_cam_dev_id },
          raw: true,
        }).then((result) => result)
          .catch((error) => {
            const err = ErrorCodes['470005'];
            throw err;
          });
        if (cameraDeviceExist) {
          // if occupant present then put in a action queue
          const data = {
            occupant_id: sharer_occupant_id,
            camera_id: cameraDeviceExist.camera_id,
            action: {
              type: 'access',
              event: 'unshare',
              value: receiver_occupant_id,
            },
            time: moment(new Date()).utc().format('DD-MM-YYYY'),
          }
          // send this object in action queue
          cameraDeviceActionQueue.sendProducer(data);
        }
      }
    }
    // deleting the attached camera permissions for this occperid by default through delete cascade.

    if (deleteOccupantsPermissions.receiver_occupant && deleteOccupantsPermissions.gateway) {
      const data = {
        item_id: deleteOccupantsPermissions.gateway_id,
        type: 'gateway',
        occupant_id: deleteOccupantsPermissions.receiver_occupant.id,
      };
      if (DPCommands.adminunshare != Command) {
        await this.deleteOccupantsDashboardAttributes(data, companyId);
      }
      const devicesList = await this.getAllDevicesOfGateway(deleteOccupantsPermissions.gateway_id);
      if (devicesList && devicesList.length > 0) {
        for (const element of devicesList) {
          const input = {
            item_id: element,
            type: 'device',
            occupant_id: deleteOccupantsPermissions.receiver_occupant.id,
          };
          if (DPCommands.adminunshare != Command) {
            await this.deleteOccupantsDashboardAttributes(input, companyId);
          }
        }
      }
    }
    const obj = {
      old: deleteOccupantsPermissions,
      new: {},
    };
    const email = deleteOccupantsPermissions.invitation_email;
    let userName = deleteOccupantsPermissions.invitation_email;
    const findInvitationEmail = await database.occupants.findOne({
      where: { email: deleteOccupantsPermissions.invitation_email },
    }).then((result) => {
      if (result && result.first_name) {
        userName = result.first_name;
      }
    });
    if (deleteOccupantsPermissions.gateway) {
      const placeholdersData = {
        gateway_name: deleteOccupantsPermissions.gateway.name || deleteOccupantsPermissions.gateway.device_code,
        email,
        user_name: userName,
        sharer_email: occupant_email,
        removed_date: moment(new Date()).utc().format('DD-MM-YYYY'),
        removed_time: moment(new Date()).utc().format('hh:mm A'),
        receiverList: [{ email }],
      };
      if (DPCommands.adminunshare != Command) {
        ActivityLogs.addActivityLog(Entities.occupants_permissions.entity_name,
          Entities.occupants_permissions.event_name.deleted,
          obj, Entities.notes.event_name.deleted, occupant_id, companyId, null, occupant_id, placeholdersData);
      }
    }
    return deletedData;
  }
}

export default OccupantsPermissionsService;
