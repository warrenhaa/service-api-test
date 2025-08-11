import xlsx from 'xlsx';
import CompaniesService from '../services/CompaniesService';
import AddressesService from '../services/AddressesService';
import LocationsService from '../services/LocationsService';
import LocationTypesService from '../services/LocationTypesService';
import Util from '../../utils/Utils';
import {
  setInCache,
  getAllFromCache,
  getOneFromCache,
  deleteFromCache,
} from '../../cache/Cache';
import CacheKeys from '../../cache/Constants';
import Logger from '../../utils/Logger';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';
import locationLevels from '../../utils/constants/LocationTypes';

const path = require('path');

const util = new Util();

class CompaniesController {
  static async createCompanies(req, res) {
    const company = {};
    company.name = req.body.name;
    company.code = req.body.code;
    company.aws_cognito_id = req.body.aws_cognito_id;
    company.aws_cognito_region = req.body.aws_cognito_region;
    company.aws_cognito_user_pool = req.body.aws_cognito_user_pool;
    company.aws_cognito_identity_pool = req.body.aws_cognito_identity_pool;
    company.aws_cognito_userpool_web_client_id = req.body.aws_cognito_userpool_web_client_id;
    company.aws_region = req.body.aws_region;
    company.aws_iot_end_point = req.body.aws_iot_end_point;
    company.device_to_user_list = req.body.device_to_user_list;
    company.user_to_device_list = req.body.user_to_device_list;
    company.aws_s3_bucket_name = req.body.aws_s3_bucket_name;
    company.es_endpoint = req.body.es_endpoint;
    company.es_username = req.body.es_username;
    company.es_password = req.body.es_password;
    company.index_name = req.body.index_name;
    company.created_by = req.user_id;
    company.updated_by = req.user_id;
    company.aws_iam_access_key = req.body.aws_iam_access_key;
    company.aws_iam_access_secret = req.body.aws_iam_access_secret;
    company.aws_s3_bucket_name = req.body.aws_s3_bucket_name;
    company.aws_topics_to_subscribe = req.body.aws_topics_to_subscribe;
    company.status = req.body.status;
    company.rate_limit_policy_id = req.body.rate_limit_policy_id;
    company.root_user_id = req.body.root_user_id;
    company.created_by = req.user_id;
    company.updated_by = req.user_id;
    company.admin_setup_url = req.admin_setup_url;
    company.contact_details = req.body.contact_details;
    company.address_id = req.body.address_id;
    company.activities_configs = req.body.activities_configs;
    company.alert_configs = req.body.alert_configs;
    company.app_urls = req.body.app_urls;
    company.templates = req.body.templates;
    const userid = req.user_id;
    const source_IP = req.source_IP;
    const companyDetail = await CompaniesService.createCompanies(company, userid, source_IP).then((value) => {
      req.body.company_id = value.dataValues.id;
      return AddressesService.createAddress(req.body, req).then(
        async (result) => {
          const id = req.body.company_id;
          req.body.address_id = result.dataValues.id;
          req.body.user_id = req.user_id;
          const siteInput = {
            name: `${req.body.name} default site`,
            type: locationLevels[0],
          };
          const buildingInput = {
            name: `${req.body.name} default building`,
            type: locationLevels[1],
          };
          const floorInput = {
            name: `${req.body.name} default floor`,
            type: locationLevels[3],
          };
          let type = await LocationTypesService.getLocationTypeByName(siteInput.type);
          req.body.type_id = type.id;
          req.body.name = siteInput.name;
          req.body.source_IP = req.source_IP;
          const defaultSite = await LocationsService.createLocations(req.body, req)
            .catch((error) => {
              const err = ErrorCodes['000007'];
              Logger.error('error', error);
              throw err;
            });
          type = await LocationTypesService.getLocationTypeByName(buildingInput.type);
          req.body.type_id = type.id;
          req.body.container_id = defaultSite.id;
          req.body.name = buildingInput.name;
          req.body.source_IP = req.source_IP;
          const defaultBuilding = await LocationsService.createLocations(req.body, req)
            .catch((error) => {
              const err = ErrorCodes['000007'];
              Logger.error('error', error);
              throw err;
            });
          type = await LocationTypesService.getLocationTypeByName(floorInput.type);
          req.body.type_id = type.id;
          req.body.container_id = defaultBuilding.id;
          req.body.name = floorInput.name;
          req.body.source_IP = req.source_IP;
          const defaultFloor = await LocationsService.createLocations(req.body, req).catch((error) => {
            Logger.error('error', error);
            const err = ErrorCodes['000007'];
            throw err;
          });
          const updateData = {};
          updateData.address_id = result.dataValues.id;
          updateData.site = {
            site_id: defaultSite.id,
            building_id: defaultBuilding.id,
            floor_id: defaultFloor.id,
          };
          const updatedCompanies = await CompaniesService.updateCompanies(updateData, id, userid);
          const companyDetails = value.dataValues;
          const addressDetails = result.dataValues;
          const mergedDetails = { ...companyDetails };
          mergedDetails.address = addressDetails;
          mergedDetails.site = defaultSite;
          return mergedDetails;
        },
      );
    }).catch((error) => {
      const err = ErrorCodes['000002'];
      Logger.error('error', error);
      throw new ApplicationError(err);
    });
    await setInCache(CacheKeys.COMPANIES, companyDetail.id, companyDetail);
    util.setSuccess(200, companyDetail);
    return util.send(req, res);
  }

  static async getAllCompanies(req, res) {
    let companies = null;
    // companies = await getAllFromCache(CacheKeys.COMPANIES);
    // if (companies && companies.length <= 0) {
    companies = await CompaniesService.getAllCompanies();
    // }
    if (companies && companies.length > 0) {
      util.setSuccess(200, companies);
    } else {
      const err = ErrorCodes['000003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getCompany(req, res) {
    const { id } = req.params;
    let company = null;
    company = await CompaniesService.getCompany(id);
    if (company) {
      util.setSuccess(200, company);
    } else {
      const err = ErrorCodes['000001'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async deleteCompanies(req, res) {
    const { id } = req.params;
    const companies = await CompaniesService.deleteCompanies(id, req.user_id, req.source_IP);
    if (companies) {
      await deleteFromCache(CacheKeys.COMPANIES, id);
      util.setSuccess(200);
    } else {
      const err = ErrorCodes['000003'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async updateCompanies(req, res) {
    const { id } = req.params;
    req.body.updated_by = req.user_id; // assigning updated_by value as user_id
    const updatedCompanies = await CompaniesService.updateCompanies(
      req.body,
      id,
      req.user_id,
      req.source_IP
    ).catch((error) => {
      const err = ErrorCodes['000004'];
      Logger.error('error', error);
      throw new ApplicationError(err);
    });
    if (updatedCompanies) {
      setInCache(CacheKeys.COMPANIES, id, updatedCompanies);
      util.setSuccess(200, updatedCompanies);
    } else {
      const err = ErrorCodes['000004'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async bulkUploadCompanies(req, res) {
    if (req.file === undefined) {
      const err = ErrorCodes['000005'];
      throw new ApplicationError(err);
    }
    const mapCompanyFields = {
      'Company Name': 'name',
      Address: 'address',
      'Company Code': 'code',
      'AWS IAM access key': 'aws_iam_access_key',
      'AWS IAM access secret': 'aws_iam_access_secret',
      'AWS Cognito id': 'aws_cognito_id',
      'AWS Cognito region': 'aws_cognito_region',
      'AWS Cognito userPoolId': 'aws_cognito_user_pool',
      'AWS Cognito identityPoolId': 'aws_cognito_identity_pool',
      'AWS Cognito userPoolWebClientId': 'aws_cognito_userpool_web_client_id',
      'AWS Topic to subscribe': 'aws_topics_to_subscribe',
      'AWS IoT Region': 'aws_region',
      'AWS IoT Endpoint': 'aws_iot_end_point',
      'Device to User list': 'device_to_user_list',
      'User to Device list': 'user_to_device_list',
      'AWS S3 bucket name': 'aws_s3_bucket_name',
      'Elastic Search Endpoint': 'es_endpoint',
      'Elastic Search Username': 'es_username',
      'Elastic Search Password': 'es_password',
      'Index Name': 'index_name',
    };
    const mapAddressFields = {
      'Line 1': 'line_1',
      'Line 2': 'line_2',
      'Line 3': 'line_3',
      City: 'city',
      State: 'state',
      Country: 'country',
      ZipCode: 'zip_code',
      GeoLocation: 'geo_location',
      TotalArea: 'total_area',
    };
    const pathOfExcel = path.join(__dirname, `../../public/uploads/${req.file.filename}`);
    const workbook = xlsx.readFile(pathOfExcel);
    const sheetNameList = workbook.SheetNames;
    const values = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);
    const address = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[1]]);
    const dict = {};
    const addressDict = {};
    values.forEach((value) => {
      const fields = value.Fields.trim();
      const key = mapCompanyFields[fields];
      const companyClone = { ...value };
      delete companyClone.Section;
      delete companyClone.Fields;
      dict[key] = value.Input;
    });
    if (address && address.length > 0) {
      address.forEach((value) => {
        const fields = value.Fields.trim();
        const key = mapAddressFields[fields];
        const addressClone = { ...value };
        delete addressClone.Fields;
        if (key === 'geo_location') {
          addressDict[key] = JSON.parse(value.Input);
        } else {
          addressDict[key] = value.Input;
        }
      });
    }
    const companyDetail = await CompaniesService.createCompanies(dict).then((value) => {
      addressDict.company_id = value.dataValues.id;
      return AddressesService.createAddress(addressDict).then(
        async (result) => {
          const companyDetails = value.dataValues;
          const addressDetails = result.dataValues;
          const mergedDetails = { ...companyDetails };
          mergedDetails.address = addressDetails;
          return mergedDetails;
        },
      );
    });
    await setInCache(CacheKeys.COMPANIES, companyDetail.id, companyDetail);
    util.setSuccess(200, companyDetail);
    return util.send(req, res);
  }
}

export default CompaniesController;
