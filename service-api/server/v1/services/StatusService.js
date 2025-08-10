import database from '../../models';

class StatusService {
  static async getStatus(req) {
    await database.companies.findOne().catch((err) => {
      throw err;
    });
    return { status: true };
  }  
}

export default StatusService;
