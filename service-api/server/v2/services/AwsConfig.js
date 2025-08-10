const AWS = require('aws-sdk');
const jwt_decode = require('jwt-decode');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const cognitoAttributeList = [];
const attributes = (key, value) => ({
  Name: key,
  Value: value,
});

const setCognitoAttributeList = function (email, first_name, last_name,
  phone_number, locale, address) {
  const attributeList = [];
  attributeList.push(attributes('email', email));
  attributeList.push(attributes('phone_number', phone_number));
  attributeList.push(attributes('address', address));
  attributeList.push(attributes('name', first_name));
  attributeList.push(attributes('family_name', last_name));
  attributeList.push(attributes('locale', locale));
  attributeList.forEach((element) => {
    cognitoAttributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(element));
  });
};

const getCognitoAttributeList = function () {
  return cognitoAttributeList;
};

const getCognitoUser = function (email, poolData) {
  const userData = {
    Username: email,
    Pool: this.getUserPool(poolData),
  };
  return new AmazonCognitoIdentity.CognitoUser(userData);
};

const getUserPool = function (poolData) {
  return new AmazonCognitoIdentity.CognitoUserPool(poolData);
};

const getAuthDetails = function (email, password) {
  const authenticationData = {
    Username: email,
    Password: password,
  };
  return new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
};

const initAWS = function (region, identityPoolId) {
  AWS.config.region = region; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId,
  });
};

const decodeJWTToken = function (token) {
  const {
    email, exp, auth_time, token_use, sub,
  } = jwt_decode(token.idToken);
  return {
    token, email, exp, uid: sub, auth_time, token_use,
  };
};

const getId = function (idToken1, data) {
  return new Promise((resolve1, reject1) => {
    const params = {
      IdentityPoolId: data.IdentityPoolId,
      AccountId: data.AccountId,
      Logins: {},
    };
    params.Logins[`cognito-idp.${data.region}.amazonaws.com/${data.UserPoolId}`] = idToken1;
    new AWS.CognitoIdentity().getId(params, (err, result) => {
      if (err) {
        console.log(err, err.stack);
        reject1(err);
      } else {
        resolve1(result);
      }
    });
  });
};

module.exports = {
  initAWS,
  getCognitoAttributeList,
  getUserPool,
  getCognitoUser,
  setCognitoAttributeList,
  getAuthDetails,
  decodeJWTToken,
  getId,
};
