const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;

const server = require('../dist-server/app');

chai.use(chaiHttp);
chai.should();

// 1 EMPTY PERMISSION
describe('/GET Get Permission', () => {
  it('It should not get permission with out auth', (done) => {
    chai.request(server)
      .get(`/api/v1/permissions/${global.userId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not get permission with wrong endpoint', (done) => {
    chai.request(server)
      .get(`/api/v1/permission/${global.userId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not get permission with wrong user id', (done) => {
    const wrongUserId = '346d9514-53a6-44b4-81a3-254844bab7';
    chai.request(server)
      .get(`/api/v1/permissions/${wrongUserId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not get permission with empty list', (done) => {
    const wrongUserId = '98063235-cd74-4372-9020-f58046aff8aB';
    chai.request(server)
      .get(`/api/v1/permissions/${wrongUserId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 2 CREATE PERMISSION

describe('/POST Create Permission', () => {
  it('It should not create permission without user id', (done) => {
    chai.request(server)
      .post('/api/v1/permissions/permissions_invite')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create permission wrong endpoint', (done) => {
    const Permission = {
      user_id: global.userId,
    };
    chai.request(server)
      .post('/api/v1/permissions/permissionsinvite')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(Permission)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should create permission', (done) => {
    const Permission = {
      user_id: global.userId,
    };
    chai.request(server)
      .post('/api/v1/permissions/permissions_invite')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(Permission)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('It should not create permission duplicate userid ', (done) => {
    const Permission = {
      user_id: global.userId,
    };
    chai.request(server)
      .post('/api/v1/permissions/permissions_invite')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(Permission)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create permission with wrong id', (done) => {
    const Permission = {
      user_id: '2bd4f277-6959-403f-969b-11e320dcc937',
    };
    chai.request(server)
      .post('/api/v1/permissions/permissions_invite')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(Permission)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 3 GET PERMISSION
describe('/GET Get Permission', () => {
  it('It should not get permission with out auth', (done) => {
    chai.request(server)
      .get(`/api/v1/permissions/${global.userId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not get permission with wrong endpoint', (done) => {
    chai.request(server)
      .get(`/api/v1/permission/${global.userId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not get permission with wrong endpoint', (done) => {
    const wrongUserId = '346d9514-53a6-44b4-81a3-254844bab7';
    chai.request(server)
      .get(`/api/v1/permissions/${wrongUserId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should get permission', (done) => {
    chai.request(server)
      .get(`/api/v1/permissions/${global.userId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 4 ADD MORE PERMISSION
describe('/POST Create Permission', () => {
  it('It should not create more permission without auth ', (done) => {
    const Permission = {
      user_id: global.userId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId2,
        ],
      },
    };
    chai.request(server)
      .post('/api/v1/permissions')
      .set('x-company-code', global.companieCode)
      .send(Permission)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not create more permission with wrong endpoint ', (done) => {
    const Permission = {
      user_id: global.userId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId2,
        ],
      },
    };
    chai.request(server)
      .post('/api/v1/permission')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(Permission)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should create more permission', (done) => {
    const Permission = {
      user_id: global.userId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId2,
        ],
      },
    };
    chai.request(server)
      .post('/api/v1/permissions')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(Permission)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not create more permission with duplicate site permission', (done) => {
    const Permission = {
      user_id: global.userId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId2,
        ],
      },
    };
    chai.request(server)
      .post('/api/v1/permissions')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(Permission)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

// 5 GET LOCATION OF USERS
describe('/GET Get LocationOf User', () => {
  it('It should get location of user', (done) => {
    chai
      .request(server)
      .get(`/api/v1/permissions/user_locations?user_id=${global.userId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not get location of users with incomplete user id', (done) => {
    const wrongUserId = 'a832dcc6-fa59-41a8-b5f9-571dd47fd90c';
    chai
      .request(server)
      .get(`/api/v1/permissions/user_locations?user_id=${wrongUserId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not get location of users with wrong end point', (done) => {
    chai
      .request(server)
      .get(`/api/v1/permission/user_locations?user_id=${global.userId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not get location of users without auth', (done) => {
    chai
      .request(server)
      .get(`/api/v1/permissions/user_locations?user_id=${global.userId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});
