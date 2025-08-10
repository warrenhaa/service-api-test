const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');
const Amplify = require('aws-amplify');
const { Auth } = require('aws-amplify');

const { describe, before } = mocha;
const { it } = mocha;
const { expect } = require('chai');

const server = require('../dist-server/app');

chai.use(chaiHttp);
chai.should();

Amplify.default.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-1:18bbc2de-586b-4078-b544-e9411916088a',
    // REQUIRED - Amazon Cognito Region
    region: 'us-east-1',
    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_7SgzK79GB',
    // OPTIONAL - Amazon Cognito Web Client ID
    userPoolWebClientId: '7kmpjhi61sa36nmd942o11k8c5',
  },
});

async function onUserSignIn(email, password) {
  const username = email;
  await Auth.signIn(username, password).then((user) => {
    global.cognito_id = user.username;
    global.accessToken = user.signInUserSession.accessToken.jwtToken;
  });
}

before(async function () {
  this.timeout(10000);
  const newLocal = 'rubye479@gmail.com';
  const mailId = newLocal;
  const password = 'Hubble@123';
  await onUserSignIn(mailId, password);
});

// 1 CREATE USER

describe('/POST Create User', () => {
  it('It should not get user from cognito id before creation', (done) => {
    chai
      .request(server)
      .get('/api/v1/users?cognito_id=c9cbad21-36a4-4fc4-8653-18ef9df81919')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should create user', (done) => {
    const createUser = {
      cognito_id: global.cognito_id,
      invite_id: global.invitationId,
    };
    chai
      .request(server)
      .post('/api/v1/users')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createUser)
      .end((err, res) => {
        global.userId = res.body.data.id;
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        done();
      });
  });
  it('It should not delete invalid user ', (done) => {
    chai.request(server)
      .delete('/api/v1/users/1c9cb8cd-0ec5-479e-9bdf-ab6ee8594a0')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not delete non existing user ', (done) => {
    chai.request(server)
      .delete('/api/v1/users/1c9cb8cd-0ec5-479e-9bdf-ab6ee8594a01')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should delete user ', (done) => {
    chai.request(server)
      .delete(`/api/v1/users/${global.userId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should create user', (done) => {
    const createUser = {
      cognito_id: global.cognito_id,
      invite_id: global.invitationId,
    };
    chai
      .request(server)
      .post('/api/v1/users')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createUser)
      .end((err, res) => {
        global.userId = res.body.data.id;
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        done();
      });
  });
  it('It should not create user with user already exist', (done) => {
    const createUser = {
      cognito_id: global.cognito_id,
      invite_id: global.invitationId,
    };
    chai
      .request(server)
      .post('/api/v1/users')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createUser)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create user with expired invited id', (done) => {
    const createUser = {
      cognito_id: global.cognito_id,
      invite_id: global.inviteExId,
    };
    chai
      .request(server)
      .post('/api/v1/users')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createUser)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create user with out user body ', (done) => {
    chai
      .request(server)
      .post('/api/v1/users')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create user with wrong end point ', (done) => {
    const createUser = {
      cognito_id: global.cognito_id,
      invite_id: global.invitationId,
    };
    chai
      .request(server)
      .post('/api/v1/user')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createUser)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not create user with invalid cognito id  ', (done) => {
    const createUser = {
      cognito_id: '2036f0c9-9aa8-4e2f-9eba-f18b1297ada7',
      invite_id: global.invitationId,
    };
    chai
      .request(server)
      .post('/api/v1/users')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createUser)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

// 2 GET USER FROM COGNITIO ID

describe('/GET Get User From Cognito Id', () => {
  it('It should get user from cognito id', (done) => {
    chai
      .request(server)
      .get(`/api/v1/users?cognito_id=${global.cognito_id}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .set('x-access-token', global.accessToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        done();
      });
  });
  it('It should not get user from cognito id with out auth', (done) => {
    chai
      .request(server)
      .get(`/api/v1/users?cognito_id=${global.cognito_id}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should get users of a company', (done) => {
    chai
      .request(server)
      .get('/api/v1/users/company')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body.data).to.be.an.instanceof(Array);
        done();
      });
  }).timeout(6000);
  it('It should not get a users list of companies from cognito id', (done) => {
    chai
      .request(server)
      .get('/api/v1/users/user_companies?cognito_id=1c9cb8cd-0ec5-479e-9bdf-ab6ee8594a01')
      .set('x-auth-token', global.token)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body.data).to.be.an.instanceof(Array);
        done();
      });
  });
  it('It should get a users list of companies from cognito id', (done) => {
    chai
      .request(server)
      .get(`/api/v1/users/user_companies?cognito_id=${global.cognito_id}`)
      .set('x-auth-token', global.token)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body.data).to.be.an.instanceof(Array);
        done();
      });
  });
  it('It should not get user from cognito id with wrong end point ', (done) => {
    chai
      .request(server)
      .get(`/api/v1/user?cognito_id=${global.cognito_id}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('It should not get user from cognito id with invalid cognito id', (done) => {
    const wrongCognitoId = '437ac095-5c6d-47ca-ab16-f8b2ab78964e';
    chai
      .request(server)
      .get(`/api/v1/user?cognito_id=${wrongCognitoId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});
