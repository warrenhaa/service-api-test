import activityLogsService from '../services/ActivityLogs';
import database from '../../models';
import { getActivityConfigsOfCompany } from '../../cache/Cache';
import Entities from '../../utils/constants/Entities';
import Logger from '../../utils/Logger';
import activityLogQueueProducer from '../../sqs/ActivityLogQueueProducer';

export default class ActivityUtils {
  static async createActivityLogs(action, entity, eventName, data) {
    try {
      const activityLogData = {};
      let activityData = data;
      if (action === 'update') {
        activityLogData.data = {};
        activityLogData.data.new = activityData[1].dataValues;
        activityLogData.data.old = activityData[1]._previousDataValues;
        // eslint-disable-next-line prefer-destructuring
        activityData = activityData[1];
      } else {
        activityLogData.data = activityData.dataValues || activityData;
      }
      activityLogData.entity = entity;
      if (entity === 'Locations') {
        const locationType = await database.location_types.findOne({ where: { id: data.type_id } });
        const locationTypeName = locationType.name;
        const event = `${locationTypeName} ${eventName}`;
        activityLogData.event_name = event;
      } else {
        activityLogData.event_name = eventName;
      }
      activityLogData.send_email = true;
      activityLogData.send_sms = true;
      activityLogData.event_time = Date.now();
      if (activityData.dataValues) {
        activityLogData.entity_id = activityData.dataValues.id;
        activityLogData.user_id = activityData.dataValues.created_by
          ? activityData.dataValues.created_by : activityData.dataValues.id;
        activityLogData.company_id = activityData.dataValues.company_id;
      } else {
        activityLogData.entity_id = activityData.id;
        activityLogData.user_id = activityData.created_by
          ? activityData.created_by : null;
        activityLogData.company_id = activityData.company_id || null;
      }
      if (entity === Entities.COMPANIES) {
        activityLogData.company_id = activityData.id;
      }
      await activityLogsService.createActivityLogs(activityLogData);
    } catch (err) {
      Logger.error('activity-log-error', err);
    }
  }

  static async addActivityLog(entity, event_name, data, notes, entity_id, company_id,
    user_id, occupant_id, placeholders_data, source_ip) {
    console.log("🚀 ~ file: ActivityUtils.js:60 ~ source_ip:", source_ip)
    return new Promise((resolve, reject) => {
      database.activity_logs.create({
        entity,
        event_name,
        data,
        notes,
        entity_id,
        user_id,
        company_id,
        event_time: new Date(),
        occupant_id,
        placeholders_data,
        source_ip,
      }).then(async (result) => {
        const activityLogConfigData = await database.activity_log_communication_configs.findOne({
          where: {
            event_name,
          },
        }).catch((err) => {
          // console.log(err);
          throw err;
        });
        if (activityLogConfigData && (activityLogConfigData.email_enabled === true
          || activityLogConfigData.sms_enabled === true || activityLogConfigData.notification_enabled === true)) {
          activityLogQueueProducer.sendProducer(result);
        }
        resolve(result);
      }).catch((err) => {
        // console.log(err);
        reject(err);
      });
    });
  }
}
