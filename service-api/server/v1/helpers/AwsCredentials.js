import { promises as fs } from 'fs';
import { getCompany } from '../../cache/Companies';
import ErrorCodes from '../../errors/ErrorCodes';

const path = require('path');

export async function createAWSCredentialPath(companyId) { 
  // get company data from cache else set in cache  
  const company = await getCompany(companyId).then(result => {
      return (result);
  }).catch((error) => {
    throw (error);
  });
  if (!company) {
    const err = ErrorCodes['000001'];
    throw (err);
  }
  const companyCreds = {};
  companyCreds.accessKeyId = company.aws_iam_access_key;
  companyCreds.secretAccessKey = company.aws_iam_access_secret;
  companyCreds.region = company.aws_region;
  const data = JSON.stringify(companyCreds);
  const pathOfJson = path.join(__dirname, `../../../public/uploads/${company.code}_config.json`);
  await fs.readFile(pathOfJson).catch(() => fs.writeFile(pathOfJson, data));
  return pathOfJson;
}

export async function getAWSDetailsFromCompanyId(companyId) {  
// get company data from cache else set in cache 
 const company = await getCompany(companyId).then(result => {
      return (result);
  }).catch((error) => {
    throw (error);
  });
  if (!company) {
    const err = ErrorCodes['000001'];
    throw (err);
  }
  const awsDetails = {};
  awsDetails.userPoolId = company.aws_cognito_user_pool;
  awsDetails.aws_cognito_identity_pool = company.aws_cognito_identity_pool;
  awsDetails.aws_cognito_userpool_web_client_id = company.aws_cognito_userpool_web_client_id;
  awsDetails.aws_cognito_region = company.aws_cognito_region;
  awsDetails.aws_iam_access_key = company.aws_iam_access_key;
  awsDetails.aws_iam_access_secret = company.aws_iam_access_secret;
  awsDetails.aws_s3_bucket_name = company.aws_s3_bucket_name;
  awsDetails.aws_region = company.aws_region;
  awsDetails.aws_iot_end_point = company.aws_iot_end_point;
  awsDetails.company_code = company.code;
  return awsDetails;
}
