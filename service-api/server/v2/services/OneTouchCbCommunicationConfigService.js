import lodash, { } from 'lodash';
import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';

class OneTouchCbCommunicationConfigService {
  static async getArrayId(gateway_code, occupant_id) {
    const gateway = await database.devices.findOne({
      where: { device_code: gateway_code },
      raw: true,
    }).then((result) => result);
    if (!gateway) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    const isHavePermission = await database.occupants_permissions.findOne({
      where: {
        receiver_occupant_id: occupant_id,
        gateway_id: gateway.id,
      },
    });
    if (!isHavePermission) {
      const err = ErrorCodes['160045'];
      throw err;
    }
    const oneTouchCbCommunicationConfig = await
    database.one_touch_cb_communication_configs.findAll({
      where: { gateway_code },
      raw: true,
    }).then((result) => result)
      .catch(() => {
        const err = ErrorCodes['330017'];
        throw err;
      });
    let arrayIds = [];
    if (oneTouchCbCommunicationConfig && oneTouchCbCommunicationConfig.length > 0) {
      arrayIds = lodash.map(oneTouchCbCommunicationConfig, 'array_id');
      console.log("🚀 ~ file: OneTouchCbCommunicationConfigService.js:39 ~ OneTouchCbCommunicationConfigService ~ getArrayId ~ arrayIds:", arrayIds)
    }
    const numberArray = Array.from({ length: 100 }, (_, index) => index + 1);
    const stringArray = numberArray.map((number) => number.toString());
    console.log('🚀 ~ file: OneTouchCbCommunicationConfigService.js:77 ~ OneTouchCbCommunicationConfigService ~ getOneTouchCbCommunicationConfig ~ stringArray:', stringArray);
    const uncommonNumbers = arrayIds.concat(stringArray)
      .filter((number) => !arrayIds.includes(number) || !stringArray.includes(number));
    console.log('🚀 ~ file: OneTouchCbCommunicationConfigService.js:99 ~ OneTouchCbCommunicationConfigService ~ getOneTouchCbCommunicationConfig ~ uncommonNumbers:', uncommonNumbers);
    const returnObj = {
      array_id: uncommonNumbers[0],
    };
    return returnObj;
  }

  static async addCbConfigs(gateway_code, config_type, camera_id, array_id, property_name,
    property_value, ruleop, device_code, occupant_id, company_id, user_id, one_touch_rule_id) {
    const gateway = await database.devices.findOne({
      where: { device_code: gateway_code },
      raw: true,
    }).then((result) => result);
    if (!gateway) {
      const err = ErrorCodes['800013'];
      throw err;
    }
    if (device_code) {
      const device = await database.devices.findOne({
        where: { device_code },
        raw: true,
      }).then((result) => result);
      if (!device) {
        const err = ErrorCodes['800019'];
        throw err;
      }
    }
    if (camera_id) {
      const camera = await database.camera_devices.findOne({
        where: {
          camera_id,
          occupant_id,
        },
        raw: true,
      }).then((result) => result);
      if (!camera) {
        const err = ErrorCodes['460000'];
        throw err;
      }
    }
    const oneTouchCbConfigs = await database.one_touch_cb_communication_configs.findOne({
      where: {
        gateway_code,
        array_id,
        config_type,
      },
      raw: true,
    }).then((result) => result)
      .catch(() => {
        const err = ErrorCodes['330018'];
        throw err;
      });
    if (!oneTouchCbConfigs) {
      const isHavePermission = await database.occupants_permissions.findOne({
        where: {
          receiver_occupant_id: occupant_id,
          gateway_id: gateway.id,
        },
      });
      if (!isHavePermission) {
        const err = ErrorCodes['160045'];
        throw err;
      }
      const oneTouchCbCommunicationConfig = await
      database.one_touch_cb_communication_configs.create({
        gateway_code,
        device_code,
        config_type,
        camera_id,
        array_id,
        occupant_id,
        property_name,
        property_value,
        ruleop,
        one_touch_rule_id,
      }).then((result) => result)
        .catch((e) => {
          console.log("🚀 ~ file: OneTouchCbCommunicationConfigService.js:122 ~ OneTouchCbCommunicationConfigService ~ e:", e)
          const err = ErrorCodes['330019'];
          throw err;
        });
      const obj = {
        new: oneTouchCbCommunicationConfig,
        old: {},
      };
      const placeholdersData = {};
      ActivityLogs.addActivityLog(Entities.one_touch_rules.entity_name,
        Entities.one_touch_rules.event_name.cbAdded, obj, Entities.notes.event_name.added,
        one_touch_rule_id,
        company_id, user_id, occupant_id, placeholdersData);
      console.log("🚀 ~ file: OneTouchCbCommunicationConfigService.js:121 ~ OneTouchCbCommunicationConfigService ~ oneTouchCbCommunicationConfig:", oneTouchCbCommunicationConfig)
      return oneTouchCbCommunicationConfig;
    }
  }
}

export default OneTouchCbCommunicationConfigService;
