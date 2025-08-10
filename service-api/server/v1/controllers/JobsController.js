import ApplicationError from '../../errors/ApplicationError';
import jobsService from '../services/JobsService';
import Util from '../../utils/Utils';

const util = new Util();

class JobsController {
  static async getJob(req, res) {
    const id = req.query.job_id;
    const jobs = await jobsService.getJob(id).then(async (result) => result).catch((err) => {
      throw new ApplicationError(err);
    });
    util.setSuccess(200, jobs);
    return util.send(req, res);
  }
}

export default JobsController;
