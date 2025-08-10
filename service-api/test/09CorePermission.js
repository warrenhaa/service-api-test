const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;

const server = require('../dist-server/app');

chai.use(chaiHttp);
chai.should();

let corePermissionId = null;

// 1 EMPTY ALL CORE PERMISSION LIST

describe('/GET Get All Core Permission', () => {
  it('It should not all get core permission', (done) => {
    chai.request(server)
      .get('/api/v1/core_permissions')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not all get core permission with wrong end point', (done) => {
    chai.request(server)
      .get('/api/v1/core_permissions')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not all get core permission without auth', (done) => {
    chai.request(server)
      .get('/api/v1/core_permissions')
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});

// 2 CREATE CORE PERMISSION

describe('/POST Core Premission', () => {
  it('It should not create core permission without auth', (done) => {
    const createPermission = {
      user_id: global.userId,
      permissions: {
        core_permissions: {
        },
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },
    };
    createPermission.permissions.core_permissions[global.rootCorePermissionMappingName] = ['update', 'delete', 'create'];
    chai.request(server)
      .post('/api/v1/core_permissions')
      .set('x-company-code', global.companieCode)
      .send(createPermission)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not create core permission with wrong endpoint', (done) => {
    const createPermission = {
      user_id: global.userId,
      permissions: {
        core_permissions: {
        },
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },
    };
    createPermission.permissions.core_permissions[global.rootCorePermissionMappingName] = ['update', 'delete', 'create'];
    chai.request(server)
      .post('/api/v1/core_permission')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createPermission)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not create core permission with undefined permission', (done) => {
    const createPermission = {
      user_id: global.userId,
      permissions: {
        core_permissions: {
        },
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },
    };
    createPermission.permissions.core_permissions.ruby = ['update', 'delete', 'create'];
    chai.request(server)
      .post('/api/v1/core_permissions')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createPermission)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('It should create core permission', (done) => {
    const createPermission = {
      user_id: global.userId,
      permissions: {
        core_permissions: {
        },
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },
    };
    createPermission.permissions.core_permissions[global.rootCorePermissionMappingName] = ['update', 'delete', 'create'];
    chai.request(server)
      .post('/api/v1/core_permissions')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createPermission)
      .end((err, res) => {
        corePermissionId = res.body.data[0][0].id;
        res.should.have.status(200);
        done();
      });
  });
});

// 3 GET CORE PERMISSION BY ID

describe('/GET Get Core Permission By Id', () => {
  it('It should get core permission by id', (done) => {
    chai.request(server)
      .get(`/api/v1/core_permissions/${corePermissionId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('It should not get core permission with wrong end point', (done) => {
    chai.request(server)
      .get(`/api/v1/core_permission/${corePermissionId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not get core permission with wrong id', (done) => {
    const wrongCoreId = '98063235-cd74-4372-9020-f58046aff8aB';
    chai.request(server)
      .get(`/api/v1/core_permission/${wrongCoreId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not get core permission without auth', (done) => {
    chai.request(server)
      .get(`/api/v1/core_permissions/${corePermissionId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not get core permission by incomplete id', (done) => {
    const wrongCoreId = 'bb040105-2e08-42f2-b0bf-d52a925ccd';
    chai.request(server)
      .get(`/api/v1/core_permissions/${wrongCoreId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

// 5 GET PERMISSION OF THE USER
describe('/GET Get Core Permission of user', () => {
  it('It should get core permission of user', (done) => {
    chai.request(server)
      .get(`/api/v1/core_permissions/user_permissions?user_id=${global.userId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should get core permission of user', (done) => {
    const wrongId = '6ce9a14f-166b-4101-96a2-4788d373520d';
    chai.request(server)
      .get(`/api/v1/core_permissions/user_permissions?user_id=${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 6 DELETE CORE PERMISSION
describe('/DELETE Core Permission', () => {
  it('It should not delete core permission with wrong end point', (done) => {
    chai.request(server)
      .delete(`/api/v1/core_permission/${corePermissionId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not delete core permission without auth', (done) => {
    chai.request(server)
      .delete(`/api/v1/core_permissions/${corePermissionId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should delete core permission', (done) => {
    chai.request(server)
      .delete(`/api/v1/core_permissions/${corePermissionId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not delete core permission with incomplete id ', (done) => {
    const wrongCoreId = '108ac357-8761-44d2-a555-f7c232508e99';
    chai.request(server)
      .delete(`/api/v1/core_permissions/${wrongCoreId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});
