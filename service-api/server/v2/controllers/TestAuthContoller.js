require('cross-fetch/polyfill');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

class TestAuthController {
  static async getToken(req, res) {
    const authenticationData = {
      Username: 'naveen.pathiyil@hubblehome.com',
      Password: 'Hubble@123',
    };
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      authenticationData,
    );
    const poolData = {
      UserPoolId: 'us-east-1_7SgzK79GB', // Your user pool id here
      ClientId: '7kmpjhi61sa36nmd942o11k8c5', // Your client id here
    };
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    const userData = {
      Username: 'naveen.pathiyil@hubblehome.com',
      Password: 'Hubble@123',
      Pool: userPool,
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');

    cognitoUser.initiateAuth(authenticationDetails, {
      onSuccess(result) {
        const response = ({ ...result });
        const { jwtToken } = response.idToken;
        res.json({
          token: jwtToken,
        });
      },
      onFailure(err) {
        // User authentication was not successful
        res.status(404).send({ msg: err, request_id: req.request_id });
      },
      customChallenge() {
        // User authentication depends on challenge response
        const challengeResponses = 'Hubble@123';
        cognitoUser.sendCustomChallengeAnswer(challengeResponses, this);
      },
    });
  }
}

export default TestAuthController;
