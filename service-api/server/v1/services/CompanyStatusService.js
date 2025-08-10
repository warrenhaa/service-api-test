import database from '../../models';

class CompanyStatusService {
  static async createCompanyStatus(body) {
    const companyStatus = await database.company_verifications.create({
      company_id: body.companyId,
      cognito: body.cognito,
      s3: body.s3,
      topics: body.topics,
      elastic_search: body.elasticSearch,
      aws_access_key: body.accessKey,
      aws_secret_key: body.secretKey,
      dynamo_db: body.dynamodb,
    });
    return companyStatus;
  }

  static async getCompanyVerificationStatus(body) {
    const companyStatus = await database.company_verifications.findOne({
      where: {
        company_id: body.id,
      },
    });
    return companyStatus;
  }

  static async getAllCompanyVerificationStatus() {
    const companyStatus = await database.company_verifications.findAll({
    });
    return companyStatus;
  }
}

export default CompanyStatusService;
