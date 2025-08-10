import { Op } from 'sequelize';
import database from '../../models';
import paginate from '../../utils/Paginate';
import ErrorCodes from '../../errors/ErrorCodes';
import Entities from '../../utils/constants/Entities';
import ActivityLogs from '../helpers/ActivityUtils';
import Logger from '../../utils/Logger';

class AlertsService {
  static async getAllAlerts(req) {
    const params = req.query;
    const page = params.page || null;
    const pageSize = params.pageSize || null;
    const startDate = params.startDate || null;
    const endDate = params.endDate || null;
    const company = {};
    company.company_id = req.body.company_id;
    const query = { ...params };
    if (startDate && endDate) {
      query.event_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
    delete query.page;
    delete query.pageSize;
    delete query.startDate;
    delete query.endDate;
    const alerts = await database.device_alerts.findAll(
      paginate(
        {
          where: query, // conditions
          raw: true,
          order: [['updated_at', 'DESC']],
        },
        { page, pageSize },
      ),
    );
    return alerts;
  }

  static async updateDeviceAlert(alert_id, company_id, occupant_id, user_id) {
    var device_alert = await database.device_alerts.findOne({
      where: {
        id: alert_id,
      },
    }).then((result) => result)
      .catch((error) => {
        Logger.error('error', error);
        const err = ErrorCodes['390002'];
        throw err;
      });
    if (!device_alert) {
      return {}
    } else {
      await database.device_alerts.update(
        { is_viewed: true },
        { where: { id: alert_id } },
      ).then((result) => result).catch((error) => {
        Logger.error('error', error);
        const err = ErrorCodes['390002'];
        throw err;
      });
      const obj = {
        old: {
          is_viewed: device_alert.is_viewed,
        },
        new: {
          is_viewed: true,
        },
      };
      ActivityLogs.addActivityLog(Entities.device_alerts.entity_name, Entities.device_alerts.event_name.updated,
        obj, Entities.notes.event_name.updated, alert_id, company_id, user_id, occupant_id, null);

      var device_alert = await database.device_alerts.findOne({
        attributes: ['id', 'alert_type', 'alert_code', 'is_viewed'],
        where: {
          id: alert_id,
        },
      }).then((result) => result)
        .catch((error) => {
          Logger.error('error', error);
          const err = ErrorCodes['390002'];
          throw err;
        });
      return device_alert;
    }
  }
}

export default AlertsService;
