import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import Util from '../../utils/Utils';
import ErrorCodes from '../../errors/ErrorCodes';
import OccupantService from '../services/OccupantService';
import UserService from '../services/UsersService';
import AccessPermissionService from '../services/AccessPermissionService';
import LocationTypesService from '../services/LocationTypesService';
import LocationsService from '../services/LocationsService';
import ActionToPermission from '../../utils/constants/ActionToPermission';
import { getCompany } from '../../cache/Companies';
import usersService from '../services/UsersService';
import { getOneFromCache, setInCache } from '../../cache/Cache';
import { CognitoIdentityClient, GetIdCommand } from "@aws-sdk/client-cognito-identity";
const { CognitoIdentityProviderClient, AdminSetUserPasswordCommand ,AdminUserGlobalSignOutCommand,GetUserCommand} = require("@aws-sdk/client-cognito-identity-provider");

const identityClient = new CognitoIdentityClient({ region: process.env.SQS_AWS_REGION,
  credentials: {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY}});

// Initialize Cognito client
const client = new CognitoIdentityProviderClient({ 
    region: process.env.SQS_AWS_REGION,
    credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
 });
const util = new Util();

export async function authVerification(req, res, next) {
  const authToken = req.headers.authorization || req.headers['x-auth-token'];
  const accessToken = req.headers['x-access-token'];
  const jwk = {
    alg: process.env.JWT_ALG, e: process.env.JWT_E, kid: process.env.JWT_KID, kty: process.env.JWT_KTY, n: process.env.JWT_N, use: process.env.JWT_USE,
  };
  const access_jwk = {
    alg: process.env.JWT_ALG, e: process.env.JWT_E, kid: process.env.ACCESSTOKEN_JWTKID, kty: process.env.JWT_KTY, n: process.env.ACCESSTOKEN_JWTN, use: process.env.JWT_USE,
  };
  const pem = jwkToPem(jwk);
  const pem_access = jwkToPem(access_jwk);

  const clientId = process.env.AWS_USER_POOL_WEB_CLIENT_ID;
  const region = process.env.AWS_COGNITO_REGION;
  const userPoolId = process.env.AWS_USER_POOL_ID;
  const iss = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

  const auth = {
    authTokenVerified: false,
    authTokenValidate: false,
    accessTokenVerified: false,
    accessTokenValidate: false,
  };
  jwt.verify(authToken, pem, { algorithms: ['RS256'] }, (err, decodedToken) => {
    if (!err) {
      // 1.verify that token is exipred or not
      // 2.The aud claim in an ID token and the client_id claim in an access token should match the app client ID
      // 3.The issuer (iss) claim should match your user pool.
      // 4.Check the token_use claim.
      auth.authTokenVerified = true;
      const exp = decodedToken.exp * 1000;
      if (new Date(exp) < new Date() || decodedToken.aud != clientId
        || decodedToken.iss != iss || decodedToken.token_use != 'id') {
        auth.authTokenValidate = true;
      }
      req.userDetails = decodedToken;
      req.source_IP = req.headers['x-forwarded-for'];
      if (typeof req.source_IP !== 'string') {
        // If it's not a string, convert it
        req.source_IP = Array.isArray(req.source_IP) ? req.source_IP[0] : String(req.source_IP);
      }
    }
  });

  if (auth.authTokenVerified != true && auth.authTokenValidate != true) {
    const error = ErrorCodes[900008];
    return util.sendError(req, res, error);
  }
  const hasResetPassword = await usersService.checkTokenListInCache(req.userDetails.email);
  // accessToken verification
  if (accessToken) {
    jwt.verify(accessToken, pem_access, { algorithms: ['RS256'] }, async(err, decodedAccessToken) => {
      if (!err) {
        // 1.verify that token is exipred or not
        // 2.The aud claim in an ID token and the client_id claim in an access token should match the app client ID
        // 3.The issuer (iss) claim should match your user pool.
        // 4.Check the token_use claim.
        auth.accessTokenVerified = true;
        const exp = decodedAccessToken.exp * 1000;
        if (new Date(exp) < new Date() || decodedAccessToken.client_id != clientId
          || decodedAccessToken.iss != iss || decodedAccessToken.token_use != 'access') {
          auth.accessTokenValidate = true;
        }
        if((process.env.VALIDATE_ACCESS_TOKEN_FROM_COGNITO==true || process.env.VALIDATE_ACCESS_TOKEN_FROM_COGNITO=="true") && hasResetPassword == true ){
          try {
            const command = new GetUserCommand({ AccessToken: accessToken });
            await client.send(command);
            next()
          } catch (error) {
              if(error.message.includes("Access Token has been revoked")){
              const error = ErrorCodes[900014];
              return util.sendError(req, res, error);
              }
          }
        }else{
          next()
        }
      }
    });
    if (auth.accessTokenVerified != true && auth.accessTokenValidate != true) {
      const error = ErrorCodes[900009];
      return util.sendError(req, res, error);
    }
  } else {
    next();
  }
}
async function getIdentityId(userSub,authToken,region,identityPoolId,userPoolId) {
  try {
    let key = "cognito-idp."+region+".amazonaws.com/"+userPoolId
    const params = {
      IdentityPoolId: identityPoolId, // Replace with your Identity Pool ID
      Logins: {}
    };
    params.Logins[key] = authToken
    let IdentityId = await getOneFromCache("identityIds",userSub)
    if(IdentityId){
      return IdentityId
    }else{
      const command = new GetIdCommand(params);
      const data = await identityClient.send(command);
      if(data &&  data.IdentityId){
        await setInCache("identityIds", userSub, data.IdentityId);
      }
      return data.IdentityId;
    }
  } catch (error) {
    throw error;
  }
}

export async function verifyCompanyCode(req, res, next) {
  const authToken = req.headers.authorization || req.headers['x-auth-token'];
  if (!req.headers['x-company-code']) {
    var error = ErrorCodes['000008'];
    return util.sendError(req, res, error);
  }
  let companyId = null;
  const company = await getCompany(null, req.headers['x-company-code']).then(result => {
    return (result);
  }).catch((error) => {
    const err = ErrorCodes['000001']; // company not found
    return util.sendError(req, res, err);
  });
  if (!company) {
    const err = ErrorCodes['000001']; // company not found
    return util.sendError(req, res, err);
  }
  companyId = company.id;

  if (companyId && typeof (companyId) === 'string') {
    let userPoolId = company.aws_cognito_user_pool;
    let identityPoolId = company.aws_cognito_identity_pool;
    let region = company.aws_cognito_region;
    if(process.env.ALLOW_WITHOUT_OCCUPANT == true || process.env.ALLOW_WITHOUT_OCCUPANT == "true"){
      if(req.userDetails){
        let sub =  req.userDetails.sub
        let identity_id = await getIdentityId(sub,authToken,region,identityPoolId,userPoolId).catch(err=>{
          var error = ErrorCodes['900008'];
          return util.sendError(req, res, error);
        })
        if(identity_id){
          req.identity_id = identity_id
        }
      }
    }
    req.company_id = companyId;
    const linkedCompanies = await OccupantService.getlinkedCompanies(companyId)
      .catch((error) => {
        const err = ErrorCodes['000001']; // company not found
        return util.sendError(req, res, err);
      });
    req.linkedCompanies = linkedCompanies;
    next();
  } else {
    var error = ErrorCodes['000001'];
    return util.sendError(req, res, error);
  }
}

export async function restrictDemoAccount(req, res, next) {
  const email = req.userDetails.email;
  const demoEmails = process.env.EMAIL_LIST;
  if(process.env.RESTRICT_DEMO_ACCOUNT == true || process.env.RESTRICT_DEMO_ACCOUNT == "true" ){
    if (demoEmails && demoEmails.includes(email)) {
      const sourceIP = req.source_IP || req.socket.remoteAddress;
      if (sourceIP == process.env.DEMO_ACCOUNT_SOURCE_IP){
        next()
      }else{
        var error = ErrorCodes[160045];
        return util.sendError(req, res, error);
      }
    }else{
      next()
    }
  }else{
    next()
  }
 
} 

export async function verifyOccupant(req, res, next) {
  if(process.env.ALLOW_WITHOUT_OCCUPANT == true || process.env.ALLOW_WITHOUT_OCCUPANT == "true"){
    req.headers.email = req.userDetails.email;
    req.occupant_id = null;
    req.user_id = null;
    next()
  }else{
  const occupantsDetails = {};
  const cognitoId = req.userDetails.sub;
  occupantsDetails.cognitoId = cognitoId;
  occupantsDetails.companyId = req.company_id;
  const occupants = await OccupantService.getCognitoIdFromOccupants(occupantsDetails)
    .catch(() => {
      const error = ErrorCodes[160010];
      return util.sendError(req, res, error);
    });
  const userDetail = await UserService.getUserIdFromCognitoId(cognitoId, req.company_id);
  if (occupants) {
    req.occupant_id = occupants.id;
    req.identity_id = occupants.identity_id;
    req.occupantDetails = occupants;
    req.headers.email = occupants.email;
    next();
  } else if (userDetail) {
    const { email } = userDetail;
    const { cognito_id } = userDetail;
    const { company_id } = userDetail;
    const { identity_id } = userDetail;
    const occupant = await OccupantService.createOccupant(
      email, cognito_id, company_id, identity_id,
    );
    req.occupant_id = occupant.id;
    req.identity_id = occupant.identity_id;
    req.occupantDetails = occupant;
    req.headers.email = email;
    next();
  } else {
    const error = ErrorCodes[160051];
    return util.sendError(req, res, error);
  }
}
}

export async function verifyUserOrOccupant(req, res, next) {
  if(process.env.ALLOW_WITHOUT_OCCUPANT == true || process.env.ALLOW_WITHOUT_OCCUPANT == "true"){
    req.headers.email = req.userDetails.email;
    req.occupant_id = null;
    req.user_id = null;
    next()
  }else{
  // check he is user or not , if user next to
  const cognitoId = req.userDetails.sub;
  let userId = null;
  const userDetail = await UserService.getUserIdFromCognitoId(cognitoId, req.company_id);
  if (userDetail) {
    const user = userDetail.dataValues;
    userId = user.id;
    req.headers.email = user.email;
    const occupantsDetails = {};
    occupantsDetails.cognitoId = cognitoId;
    occupantsDetails.companyId = req.company_id;
    const occupants = await OccupantService.getCognitoIdFromOccupants(occupantsDetails)
      .catch(() => {
        const error = ErrorCodes[160010];
        return util.sendError(req, res, error);
      });

    req.header.isAdmin = false;
    if (occupants) {
      if (occupants.email != process.env.ADMIN_EMAIL) {
        req.occupant_id = occupants.id;
        req.identity_id = occupants.identity_id;
        req.occupantDetails = occupants;
        if (!req.query.id) {
          req.query.id = occupants.id;
        }
        req.headers.email = occupants.email;
      } else {
        req.header.isAdmin = true;
      }
    }
  }
  const source = req.headers['x-source'];
  if ((userId && (req.method != 'DELETE' && !req.path.includes("/users"))) || (userId && source && source == 'console-ui')) {
    req.user_id = userId;
    next();
  } else {
    const occupantsDetails = {};
    occupantsDetails.cognitoId = cognitoId;
    occupantsDetails.companyId = req.company_id;
    const occupants = await OccupantService.getCognitoIdFromOccupants(occupantsDetails)
      .catch(() => {
        const err = ErrorCodes[160010];
        return util.sendError(req, res, err);
      });

    req.header.isAdmin = false;
    if (occupants) {
      if (occupants.email != process.env.ADMIN_EMAIL) {
        req.occupant_id = occupants.id;
        req.identity_id = occupants.identity_id;
        req.occupantDetails = occupants;
        if (!req.query.id) {
          req.query.id = occupants.id;
        }
        req.headers.email = occupants.email;
        next();
      } else {
        req.header.isAdmin = true;
        // var error = ErrorCodes[160052];
        // return util.sendError(req, res, error);
      }
    } else {
      var error = ErrorCodes[160010];
      return util.sendError(req, res, error);
    }
  }
  }
}

export async function verifyUser(req, res, next) {
  const cognitoId = req.userDetails.sub;
  const request = {};
  request.body = {};
  request.query = {};
  request.params = {};
  request.body.company_id = req.company_id;
  request.query.cognito_id = cognitoId;
  request.headers = req.headers;
  let userPermissions = null;
  const userDetails = {};
  userDetails.cognitoId = cognitoId;
  userDetails.companyId = req.company_id;
  let userId = null;
  const userDetail = await UserService.getUserIdFromCognitoId(cognitoId, req.company_id);
  if (userDetail) {
    const user = userDetail.dataValues;
    userDetails.userId = user.id;
    userId = user.id;
    req.headers.email = user.email;
  }
  if (userId) {
    request.query.user_id = userId;
    request.params.id = userId;
    userPermissions = await AccessPermissionService.getAccessPermissions(request);
    req.user_id = userId;
    req.user_permissions = userPermissions;
    if (req.path.includes('/api/v1/locations/importLocations')) {
      next();
    }
    if (req.serviceModule === 'locations' && (['PUT', 'POST', 'DELETE'].includes(req.method))) {
      let typeId = req.body.type_id;
      if (!typeId) {
        const locationId = req.params.id;
        if (!locationId) {
          var error = ErrorCodes[500002];
          return util.sendError(req, res, error);
        }
        const location = await LocationsService.getLocation(locationId);
        if (!location) {
          var error = ErrorCodes[150003];
          return util.sendError(req, res, error);
        }
        typeId = location.location_type.id;
      }
      const locationType = await LocationTypesService.getLocationType(typeId);
      const locationTypePermission = userPermissions.core_permissions[locationType.name];
      if (locationTypePermission && locationTypePermission.includes(ActionToPermission[req.method])) {
        next();
      } else {
        var error = ErrorCodes[140000];
        return util.sendError(req, res, error);
      }
      return;
    }
    const moduleCheck = req.serviceModule;
    const userPermissionDetail = userPermissions.core_permissions[moduleCheck];

    if (userPermissionDetail) {
      const permission = userPermissionDetail.includes(ActionToPermission[req.method]);
      if (permission || req.serviceModule == 'user_preferences') {
        next();
      } else {
        var error = ErrorCodes[140000];
        return util.sendError(req, res, error);
      }
    } else {
      var error = ErrorCodes[140000];
      return util.sendError(req, res, error);
    }
  } else {
    var error = ErrorCodes[900010];
    return util.sendError(req, res, error);
  }
}
