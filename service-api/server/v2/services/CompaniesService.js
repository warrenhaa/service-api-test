import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import { createAWSCredentialPath } from '../helpers/AwsCredentials';
import { getCompany } from '../../cache/Companies';
import ErrorCodes from '../../errors/ErrorCodes';

class CompaniesService {
  static async createCompanies(body, userId) {
    const companies = await database.companies.create({
      name: body.name,
      code: body.code,
      aws_cognito_id: body.aws_cognito_id,
      aws_cognito_identity_pool: body.aws_cognito_identity_pool,
      aws_cognito_region: body.aws_cognito_region,
      aws_cognito_user_pool: body.aws_cognito_user_pool,
      aws_cognito_userpool_web_client_id: body.aws_cognito_userpool_web_client_id,
      aws_iam_access_key: body.aws_iam_access_key,
      aws_iam_access_secret: body.aws_iam_access_secret,
      aws_iot_end_point: body.aws_iot_end_point,
      aws_region: body.aws_region,
      aws_s3_bucket_name: body.aws_s3_bucket_name,
      aws_topics_to_subscribe: body.aws_topics_to_subscribe,
      device_to_user_list: body.device_to_user_list,
      es_endpoint: body.es_endpoint,
      es_password: body.es_password,
      es_username: body.es_username,
      index_name: body.index_name,
      user_to_device_list: body.user_to_device_list,
      created_by: body.created_by,
      updated_by: body.updated_by,
      admin_setup_url: body.admin_setup_url,
      contact_details: body.contact_details,
      address_id: body.address_id,
      site: body.site,
      activities_configs: body.activities_configs,
      alert_configs: body.alert_configs,
      app_urls: body.app_urls,
      templates: body.templates,
    });
    const Obj = {
      old: {},
      new: companies,
    };
    if (companies) {
      ActivityLogs.addActivityLog(Entities.companies.entity_name, Entities.companies.event_name.added,
        Obj, Entities.notes.event_name.added, companies.id, companies.id, userId, null);
    }
    return companies;
  }

  static async getAllCompanies() {
    const companies = await database.companies.findAll({
      attributes: ['id', 'name', 'code', 'admin_setup_url', 'root_user_id'],
      include: [
        {
          model: database.addresses,
        },
      ],
      order: [
        [database.addresses, 'created_at', 'asc'],
      ],
    });
    return companies;
  }

  static async getCompanyDetails(id) {
    // get company data from cache if not present set
    const companies = await getCompany(id).then(result => {
      return (result);  
    }).catch((error) => {
      throw (error);
    });
    if (!companies) {
      const err = ErrorCodes['000001'];
      throw (err);
    }   
    return companies;
  }

  static async getCompany(id) {
    // get company data from cache if not present set
    const companies = await getCompany(id).then(result => {
      return (result);  
    }).catch((error) => {
      throw (error);
      
    });
    if (!companies) {
      const err = ErrorCodes['000001'];
      throw (err);
    }
    return companies;
  }

  static async updateCompanies(updatedata, id, userId) {
    const oldObj = {};
    const newObj = {};
    // get company data from cache if not present set
    const companyToUpdate = await getCompany(id).then(result => {
      return (result);  
    }).catch((error) => {
      throw (error);
    });    
    if (!companyToUpdate) {
      const err = ErrorCodes['000001'];
      throw (err);
    }
    if (companyToUpdate) {
      const updateCompaniesData = await database.companies.update(updatedata, {
        where: { id },
        returning: true,
      });

      const findUpdateCompanyDataExist = { ...updatedata };
      delete findUpdateCompanyDataExist.company_id;
      delete findUpdateCompanyDataExist.line_1;
      delete findUpdateCompanyDataExist.line_2;
      delete findUpdateCompanyDataExist.line_3;
      delete findUpdateCompanyDataExist.city;
      delete findUpdateCompanyDataExist.state;
      delete findUpdateCompanyDataExist.country;
      delete findUpdateCompanyDataExist.zip_code;
      delete findUpdateCompanyDataExist.geo_location;
      delete findUpdateCompanyDataExist.created_at;
      delete findUpdateCompanyDataExist.updated_at;
      delete findUpdateCompanyDataExist.total_area;

      Object.keys(updatedata).forEach((key) => {
        if (findUpdateCompanyDataExist.hasOwnProperty(key) && JSON.stringify(companyToUpdate[key]) != JSON.stringify(findUpdateCompanyDataExist[key])) {
          oldObj[key] = companyToUpdate[key];
          newObj[key] = findUpdateCompanyDataExist[key];
        }
      });
      const obj = {
        old: oldObj,
        new: newObj,
      };

      const findUpdateAddressDataExist = { ...updatedata };
      delete findUpdateAddressDataExist.name;
      delete findUpdateAddressDataExist.code;
      delete findUpdateAddressDataExist.aws_cognito_id;
      delete findUpdateAddressDataExist.aws_cognito_region;
      delete findUpdateAddressDataExist.aws_cognito_user_pool;
      delete findUpdateAddressDataExist.aws_cognito_identity_pool;
      delete findUpdateAddressDataExist.aws_iot_end_point;
      delete findUpdateAddressDataExist.es_endpoint;
      delete findUpdateAddressDataExist.es_username;
      delete findUpdateAddressDataExist.created_at;
      delete findUpdateAddressDataExist.updated_at;
      delete findUpdateAddressDataExist.es_password;
      delete findUpdateAddressDataExist.root_user_id;
      delete findUpdateAddressDataExist.created_by;
      delete findUpdateAddressDataExist.updated_by;
      delete findUpdateAddressDataExist.admin_setup_url;
      delete findUpdateAddressDataExist.contact_details;
      delete findUpdateAddressDataExist.alert_congigs;
      delete findUpdateAddressDataExist.activities_configs;
      delete findUpdateAddressDataExist.app_urls;
      delete findUpdateAddressDataExist.templates;
      delete findUpdateAddressDataExist.site;
      delete findUpdateAddressDataExist.address_id;
      delete findUpdateAddressDataExist.rate_limit_policy_id;
      delete findUpdateAddressDataExist.status;
      delete findUpdateAddressDataExist.index_name;
      delete findUpdateAddressDataExist.aws_region;
      delete findUpdateAddressDataExist.aws_topic_to_subscribe;
      delete findUpdateAddressDataExist.user_to_device_list;
      delete findUpdateAddressDataExist.device_to_user_list;
      delete findUpdateAddressDataExist.aws_s3_bucket_name;
      delete findUpdateAddressDataExist.aws_iam_access_key;
      delete findUpdateAddressDataExist.aws_iam_access_secret;

      let updateAddress = {};
      if (Object.keys(findUpdateAddressDataExist).length > 0) {
        updateAddress = database.addresses.update(findUpdateAddressDataExist, {
          where: { id: companyToUpdate.address.id },
          returning: true,
        });
        oldObj.address = {};
        newObj.address = {};
        Object.keys(findUpdateAddressDataExist).forEach((key) => {
          if (JSON.stringify(companyToUpdate.address[key]) !== JSON.stringify(findUpdateAddressDataExist[key])) {
            oldObj.address[key] = companyToUpdate.address[key];
            newObj.address[key] = findUpdateAddressDataExist[key];
          }
        });
        const addressObj = {
          old: oldObj.address,
          new: newObj.address,
        };

        if (Object.keys(oldObj.address).length < 1) {
          delete oldObj.address;
        }
        if (Object.keys(newObj.address).length < 1) {
          delete newObj.address;
        }
        if (Object.keys(oldObj.address).length && Object.keys(newObj.address).length > 0) {
          ActivityLogs.addActivityLog(Entities.addresses.entity_name, Entities.addresses.event_name.updated,
            addressObj, Entities.notes.event_name.updated, companyToUpdate.address.id, companyToUpdate.id, userId, null);
        }
      }
      await createAWSCredentialPath(id);
      const objPath = { ...updateCompaniesData[1] };
      if (!objPath.created_by) {
        objPath.created_by = userId;
      }

      if (oldObj.address && Object.keys(oldObj.address).length < 1) {
        delete oldObj.address;
      }
      if (newObj.address && Object.keys(newObj.address).length < 1) {
        delete newObj.address;
      }
      if (Object.keys(oldObj).length > 0 && Object.keys(newObj).length > 0) {
        ActivityLogs.addActivityLog(Entities.companies.entity_name, Entities.companies.event_name.updated,
          obj, Entities.notes.event_name.updated, companyToUpdate.id, companyToUpdate.id, userId, null);
      }
      return updateCompaniesData[1];
    }
    return null;
  }

  static async deleteCompanies(id, userId) {
    // get company data from cache if not present set
    const companiesToDelete = await getCompany(id).then(result => {
      return (result);  
    }).catch((error) => {
      throw (error);
    });
    if (!companiesToDelete) {
      const err = ErrorCodes['000001'];
      throw (err);
    }
    if (companiesToDelete) {
      const obj = {
        old: companiesToDelete,
        new: {},
      };
      return database.companies
        .destroy({
          where: { id },
          returning: true,
          raw: true,
        })
        .then(async () => {
          await database.addresses.destroy({
            where: { id: companiesToDelete.id },
            returning: true,
            raw: true,
          });
          ActivityLogs.addActivityLog(Entities.companies.entity_name, Entities.companies.event_name.deleted,
            obj, Entities.notes.event_name.deleted, companiesToDelete.id, null, userId, null);
          return companiesToDelete;
        });
    }
    return null;
  }

  static async getCompanyIDfromCode(companyCode) {
    // get company data from cache if not present set
    const company = await getCompany(null, companyCode).then(result => {
      return (result);  
    }).catch((error) => {
      console.log(error);
      throw (error);
    });
    if (!company) {
      const err = ErrorCodes['000001'];
      throw (err);
    }
    return company;
  }
}

export default CompaniesService;
