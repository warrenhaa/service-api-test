import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';

const { Op } = database.Sequelize;

class OneTouchCommunicationConfigService {
  static async getOneTouchCommunicationConfigData(id) {
    const oneTouchCommunicationConfigObj = await database.one_touch_communication_configs.findOne({
      where: { id },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['330006'];
      throw err;
    });
    return oneTouchCommunicationConfigObj;
  }

  static async createOneTouchCommunicationConfigData(one_touch_rule_id, action_trigger_key, emails, phone_numbers, message, companyId, occupantId, source_IP) {
    const createOneTouchCommunicationConfig = await database.one_touch_communication_configs.create({
      one_touch_rule_id,
      action_trigger_key,
      emails: emails || [],
      phone_numbers: phone_numbers || [],
      message,
      company_id: companyId,
    }).then((result) => result)
      .catch((error) => {
        const err = ErrorCodes['330009'];
        throw err;
      });

    if (!createOneTouchCommunicationConfig) {
      const err = ErrorCodes['330009'];
      throw err;
    }
    const obj = {
      new: createOneTouchCommunicationConfig,
      old: {},
    };
    const placeholdersData = {};
    ActivityLogs.addActivityLog(Entities.one_touch_communication_config.entity_name, Entities.one_touch_communication_config.event_name.added,
      obj, Entities.notes.event_name.added, createOneTouchCommunicationConfig.id,
      companyId, null, occupantId, placeholdersData, source_IP);
    return createOneTouchCommunicationConfig;
  }

  static async getOneTouchCommunicationConfigActionData(action_trigger_key) {
    const oneTouchCommunicationConfigObj = await database.one_touch_communication_configs.findOne({
      where: { action_trigger_key },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['330010'];
      throw err;
    });
    return oneTouchCommunicationConfigObj;
  }

  static async getOneTouchCommunicationConfig(id) {
    const oneTouchCommunicationConfigObj = await database.one_touch_communication_configs.findOne({
      where: { id },
      raw: true,
    }).then((result) => result)
      .catch(() => {
        const err = ErrorCodes['330006'];
        throw err;
      });
    if (!oneTouchCommunicationConfigObj) {
      const err = ErrorCodes['330006'];
      throw err;
    }
    return oneTouchCommunicationConfigObj;
  }

  static async addOneTouchCommunicationConfig(one_touch_rule_id, action_trigger_key, emails, phone_numbers, message, companyId, occupantId, source_IP) {
    const getOneTouchRuleObj = await database.one_touch_rules.findOne({
      where: { id: one_touch_rule_id },
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['330002'];
      throw err;
    });
    if (!getOneTouchRuleObj) {
      const err = ErrorCodes['330002'];
      throw err;
    }
    const oneTouchCommunicationConfigObj = await database.one_touch_communication_configs.findOne({
      where: { action_trigger_key },
      raw: true,
    }).then((result) => result)
      .catch(() => {
        const err = ErrorCodes['330006'];
        throw err;
      });
    if (oneTouchCommunicationConfigObj) {
      const err = ErrorCodes['330014'];
      throw err;
    }
    if (!message) {
      const oneTouchname = getOneTouchRuleObj.rule.name
      message = `${oneTouchname} alert message`;
    };
    const createOneTouchCommunicationConfig = await database.one_touch_communication_configs.create({
      one_touch_rule_id,
      action_trigger_key,
      emails: emails || [],
      phone_numbers: phone_numbers || [],
      message: message || '',
      company_id: companyId,
    }).then((result) => result)
      .catch((e) => {
        console.log("🚀 ~ file: OneTouchCommunicationConfigService.js:95 ~ OneTouchCommunicationConfigService ~ addOneTouchCommunicationConfig ~ e:", e)
        const err = ErrorCodes['330009'];
        throw err;
      });

    if (!createOneTouchCommunicationConfig) {
      const err = ErrorCodes['330009'];
      throw err;
    }
    const obj = {
      new: createOneTouchCommunicationConfig,
      old: {},
    };
    const placeholdersData = {};
    ActivityLogs.addActivityLog(Entities.one_touch_communication_config.entity_name, Entities.one_touch_communication_config.event_name.added,
      obj, Entities.notes.event_name.added, createOneTouchCommunicationConfig.id,
      companyId, null, occupantId, placeholdersData, source_IP);
    return createOneTouchCommunicationConfig;
  }

  static async updateOneTouchCommunicationConfig(id, body, companyId, occupantId, source_IP) {
    const oldObj = {};
    const newObj = {};
    const oneTouchCommunicationConfig = await this.getOneTouchCommunicationConfigData(id);
    if (!oneTouchCommunicationConfig) {
      const err = ErrorCodes['330006'];
      throw err;
    }
    if (body.action_trigger_key) {
      const actionTriggerKey = await database.one_touch_communication_configs.findOne({
        where: {
          action_trigger_key: body.action_trigger_key,
          id: {
            [Op.ne]: id
          }
        },
        raw: true,
      }).then((result) => result).catch(() => {
        const err = ErrorCodes['330006'];
        throw err;
      });
      if (actionTriggerKey) {
        const err = ErrorCodes['330014'];
        throw err;
      }
    }
    const updateOneTouchCommunicationConfig = await database.one_touch_communication_configs.update(body, {
      where: { id },
      returning: true,
      raw: true,
    }).then((result) => result)
      .catch(() => {
        const err = ErrorCodes['330007'];
        throw err;
      });
    const afterUpdate = await this.getOneTouchCommunicationConfigData(id);
    if (!afterUpdate) {
      const err = ErrorCodes['330006'];
      throw err;
    }
    Object.keys(body).forEach((key) => {
      if (JSON.stringify(oneTouchCommunicationConfig[key]) !== JSON.stringify(body[key])) {
        oldObj[key] = oneTouchCommunicationConfig[key];
        newObj[key] = body[key];
      }
    });
    const obj = {
      old: oldObj,
      new: newObj,
    };
    const deletedExistingData = { ...oneTouchCommunicationConfig };
    delete deletedExistingData.updated_at;

    const deletedAfterUpdate = { ...afterUpdate };
    delete deletedAfterUpdate.updated_at;

    const placeholdersData = {};

    if (JSON.stringify(deletedExistingData) !== JSON.stringify(deletedAfterUpdate)) {
      ActivityLogs.addActivityLog(Entities.one_touch_communication_config.entity_name, Entities.one_touch_communication_config.event_name.updated,
        obj, Entities.notes.event_name.updated, id, companyId, null, occupantId, placeholdersData, source_IP);
    }
    return afterUpdate;
  }

  static async deleteOneTouchCommunicationConfig(id, companyId, occupantId, source_IP) {
    const oneTouchCommunicationConfig = await this.getOneTouchCommunicationConfigData(id);
    if (!oneTouchCommunicationConfig) {
      const err = ErrorCodes['330006'];
      throw err;
    }
    const oneTouchCommunicationConfigObj = await database.one_touch_communication_configs.destroy({
      where: { id },
      returning: true,
    }).then((result) => result)
      .catch(() => {
        const err = ErrorCodes['330008'];
        throw err;
      });
    if (!oneTouchCommunicationConfigObj) {
      const err = ErrorCodes['330008'];
      throw err;
    }
    const obj = {
      new: {},
      old: oneTouchCommunicationConfig,
    };
    const placeholdersData = {};

    ActivityLogs.addActivityLog(Entities.one_touch_communication_config.entity_name, Entities.one_touch_communication_config.event_name.deleted,
      obj, Entities.notes.event_name.deleted, oneTouchCommunicationConfig.one_touch_rule_id, companyId, null, occupantId, placeholdersData, source_IP);
    return {
      message: 'One touch config deleted successfully',
    };
  }
}

export default OneTouchCommunicationConfigService;
