import { getCompany } from '../../cache/Companies';
import ErrorCodes from '../../errors/ErrorCodes';

const AWS = require('aws-sdk');

class CommunicateWithAwsIotService {
  static async communicateWithAwsIot(params, company_id, type) {
    return new Promise(async (resolve, reject) => {
      // get company data from cache else set in cache  
      const company = await getCompany(company_id).then(result => {
        return (result);
      }).catch((error) => {
        reject(error);
      });
      if (!company) {
        const err = ErrorCodes['000001'];
        reject(err);
      }
      const iotendpoint = `iot.${company.aws_region}.amazonaws.com`;
      const iotdata = new AWS.IotData({
        endpoint: company.aws_iot_end_point,
        region: company.aws_region,
        accessKeyId: company.aws_iam_access_key,
        secretAccessKey: company.aws_iam_access_secret,
      });
      const iot = new AWS.Iot({
        endpoint: iotendpoint,
        region: company.aws_region,
        accessKeyId: company.aws_iam_access_key,
        secretAccessKey: company.aws_iam_access_secret,
      });
      // console.log("AWS-IOT-API-Call", "/v2", new Date(), type, params)
      if (type == 'getThingShadow') {
        iotdata.getThingShadow(params, async (err, data) => {
          if (err) {
            console.log("AWS-IOT-API-ERROR", "/v2", new Date(), type, params, err)
            resolve(null);
          } // an error occurred
          else {
            // console.log(data);
            resolve(data);
          } // successful response
        });
      } else if (type == 'updateThingShadow') {
        iotdata.updateThingShadow(params, async (err, data) => {
          if (err) {
            console.log("AWS-IOT-API-ERROR", "/v2", new Date(), type, params, err)
            resolve(null);
          } // an error occurred
          else {
            resolve(data);
          } // successful response
        });
      } else if (type == 'deleteThingShadow') {
        iotdata.deleteThingShadow(params, async (err, data) => {
          if (err) {
            console.log("AWS-IOT-API-ERROR", "/v2", new Date(), type, params, err)
            resolve(null);
          } // an error occurred
          else {
            resolve(data);
          } // successful response
        });
      } else if (type == 'deleteThing') {
        iot.deleteThing(params, async (err, data) => {
          if (err) {
            console.log("AWS-IOT-API-ERROR", "/v2", new Date(), type, params, err)
            resolve(null);
          } // an error occurred
          else {
            resolve(data);
          } // successful response
        });
      } else if (type == 'publish') {
        iotdata.publish(params, async (err, data) => {
          if (err) {
            console.log("AWS-IOT-API-ERROR", "/v2", new Date(), type, params, err)
            resolve(null);
          } // an error occurred
          else {
            resolve(data);
          } // successful response
        });
      } else if (type == 'listThingsInThingGroup') {
        params["maxResults"] = 250
        iot.listThingsInThingGroup(params, async (err, data) => {
          if (err) {
            console.log("AWS-IOT-API-ERROR", "/v2", new Date(), type, params, err)
            resolve(null);
          } // an error occurred
          else {
            let things = []
            if (data && data.things) {
              things = data.things
            }
            if (data && data.nextToken) {
              params["nextToken"] = data.nextToken
              const gatewaythings = await this.communicateWithAwsIot(params, company_id, type);
              if (gatewaythings && gatewaythings.things) {
                things = things.concat(gatewaythings.things);
              }
              resolve({ things });
            } else {
              resolve({ things });
            }
          } // successful response
        });
      }
    });
  }
}

export default CommunicateWithAwsIotService;
