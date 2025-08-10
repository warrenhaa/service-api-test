import AWS from 'aws-sdk';
import lodash from 'lodash';
import database from '../../models';
import Logger from '../../utils/Logger';
import DynamoDB from '../../dynamodb';
import ErrorCodes from '../../errors/ErrorCodes';

const { Op } = database.Sequelize;
const { docClient } = DynamoDB;

class OccupantDashboardService {
  static async getUserData(userid) {
    // passing event parameter to validate entered userid exist or not
    const params = {
      TableName: 'UserToDeviceList',
      ProjectionExpression: 'userid, Own, Sharer, UserName',
      KeyConditionExpression: '#uid = :val',
      ExpressionAttributeNames: {
        '#uid': 'userid',
      },
      ExpressionAttributeValues: {
        ':val': userid,
      },
    };
    const data = await docClient.query(params).promise().catch((error) => {
      Logger.error('error', error);
      const err = ErrorCodes['340000'];
      throw err;
    });
    return data;
  }

  static async getGatewayIdList(userData) {
    const ownString = userData.Items[0].Own.replace(/\\/g, '');
    const ownObj = JSON.parse(ownString);
    const ownList = ownObj.list || [];

    const sharerString = userData.Items[0].Sharer.replace(/\\/g, '');
    const sharerObj = JSON.parse(sharerString);
    const sharerList = sharerObj.list || [];

    const gatewayList = ownList.concat(sharerList);

    return gatewayList;
  }
}
export default OccupantDashboardService;
