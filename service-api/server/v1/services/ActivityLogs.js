import { Op } from 'sequelize';
import database from '../../models';
import paginate from '../../utils/Paginate';

class ActivityLogs {
  static async createActivityLogs(body) {
    await database.activity_logs.create({
      entity: body.entity,
      event_name: body.event_name,
      data: body.data,
      notes: body.notes,
      event_time: Date.now(),
      entity_id: body.entity_id,
      user_id: body.user_id,
      request_id: body.request_id,
      source_ip: body.source_ip,
      company_id: body.company_id,
      activity_config_id: body.activity_config_id,
    });
  }

  static async getAllActivityLogs(req) {
    const params = req.query;
    const page = params.page || null;
    const pageSize = params.pageSize || null;
    const startDate = params.startDate || null;
    const endDate = params.endDate || null;
    const company = {};
    company.company_id = req.body.company_id;
    const query = { ...params, ...company };
    if (startDate && endDate) {
      query.event_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
    delete query.page;
    delete query.pageSize;
    delete query.startDate;
    delete query.endDate;
    const activityLogs = await database.activity_logs.findAndCountAll(
      paginate(
        {
          include: [{
            attributes: ['name', 'email'],
            model: database.users,
          }],
          where: query,
          order: [['updated_at', 'DESC']],
        },
        { page, pageSize },
      ),
    );
    return activityLogs;
  }
}

export default ActivityLogs;
