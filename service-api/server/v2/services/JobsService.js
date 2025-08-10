import genericJobQueue from '../../sqs/GenericJobQueueProducer';
import database from '../../models';
import ErrorCodes from '../../errors/ErrorCodes';

class jobsService {
  static createJob(type, input, companyId, createdBy, updatedBy, metadata = null, request_id) {
    return new Promise((resolve, reject) => {
      database.jobs.create({
        type, status: 'Started', input, company_id: companyId, created_by: createdBy, updated_by: updatedBy, meta_data: metadata, request_id,
      })
        .then((result) => {
          const jobId = result.id;
          const obj = {
            jobId,
            type,
            input,
            companyId,
          };
          genericJobQueue.sendProducer(obj);
          resolve(result);
        }).catch((err) => {
          reject(err);
        });
    });
  }

  static updateJob(status, id) {
    return new Promise((resolve, reject) => {
      database.jobs.update({ status }, {
        where: {
          id,
        },
      }).then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static async getJob(id) {
    const job = await database.jobs.findAll({
      include: [
        {
          attributes: ['id', 'entity', 'event_name', 'notes', 'event_time', 'entity_id'],
          model: database.activity_logs,
          as: 'activity_logs',
        }],
      where: {
        id,
      },
    }).catch(() => {
      const err = ErrorCodes['430000'];
      throw err;
    });
    return job;
  }
}
export default jobsService;
