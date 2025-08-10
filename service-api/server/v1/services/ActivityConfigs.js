import database from '../../models';

class ActivityConfigs {
  static async createActivityConfigs(req) {
    const { body } = req;
    const config = await database.activity_configs.create({
      entity: body.entity,
      send_email: body.send_email,
      send_sms: body.send_sms,
      company_id: body.company_id,
    });
    return config;
  }

  static async getActivityConfigsOfCompany(req) {
    const companyId = req.body.company_id;
    const locationTypes = await database.activity_configs.findAll({
      where: {
        company_id: companyId,
      },
    });
    return locationTypes;
  }

  static async deleteActivityConfig(req) {
    const { id } = req.params;
    const inviteToDelete = await database.activity_configs.findOne({ where: { id } });
    if (inviteToDelete) {
      const deletedInvite = await database.activity_configs.destroy({
        where: { id },
      });
      return deletedInvite;
    }
    return null;
  }
}

export default ActivityConfigs;
