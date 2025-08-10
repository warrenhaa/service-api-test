const AWS = require('aws-sdk');
const Logger = require('../utils/Logger');

AWS.config.update({
  region: process.env.DYNAMODB_AWS_REGION,
  accessKeyId: process.env.DYNAMODB_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.DYNAMODB_AWS_SECRET_ACCESS_KEY,
});

const docClient = new AWS.DynamoDB.DocumentClient();

const getFromTable = function (params) {
  return new Promise((resolve, reject) => {
    docClient.scan(params, (err, data) => {
      if (err) {
        Logger.error('Error ', { error: err.stack });
        reject(err);
      } else {
        console.log('Success', data);
        if (data.Item) {
          resolve(data.Item);
        } else if (data.Items) {
          resolve(data.Items);
        } else {
          resolve(null);
        }
      }
    });
  });
};

const addToTable = function (params) {
  return new Promise((resolve, reject) => {
    docClient.put(params, (err, data) => {
      if (err) {
        console.log('Error', err);
        reject(err);
      } else {
        console.log('Success', data);
        resolve();
      }
    });
  });
};

const updateTable = function (params) {
  return new Promise((resolve, reject) => {
    docClient.update(params, (err, data) => {
      if (err) {
        console.log('Error', err);
        reject(err);
      } else {
        console.log('Success', data);
        resolve();
      }
    });
  });
};

const generateUpdateQuery = (fields, exp) => {
  Object.entries(fields).forEach(([key, item]) => {
    exp.UpdateExpression += ` #${key} = :${key},`;
    exp.ExpressionAttributeNames[`#${key}`] = key;
    exp.ExpressionAttributeValues[`:${key}`] = item;
  });
  exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
  return exp;
};

const deleteFromTable = function (params) {
  return new Promise((resolve, reject) => {
    docClient.delete(params, (err, data) => {
      if (err) {
        console.log('Error', err);
        reject(err);
      } else {
        console.log('Success', data);
        resolve();
      }
    });
  });
};
module.exports = {
  docClient, getFromTable, addToTable, updateTable, deleteFromTable, generateUpdateQuery,
};
