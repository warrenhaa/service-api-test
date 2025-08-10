const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const server = require('../dist-server/app');

chai.use(chaiHttp);
chai.should();

let corePermissionName = null;
let corePermissionId = null;

function generateRandomCoreMapping(element) {
  const random = element + Math.random();
  return random;
}

// 1 EMPTY CORE PERMISSION MAPPING LIST

describe('/GET Get All Core Mapping List ', () => {
  it('It should not get all core permission mapping list', (done) => {
    chai.request(server)
      .get('/api/v1/core_permissions_mapping')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 2 CREATE CORE PERMISSION MAPPING

describe('/POST Create Core Permission Mapping', () => {
  it('It should create core permission mapping', (done) => {
    const element = 'alert';
    const coreMappingName = generateRandomCoreMapping(element);
    const createCoreMapping = {
      name: coreMappingName,
    };
    chai.request(server)
      .post('/api/v1/core_permissions_mapping')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createCoreMapping)
      .end((err, res) => {
        corePermissionName = res.body.data.name;
        corePermissionId = res.body.data.id;
        res.should.have.status(200);
        done();
      });
  });
  it('It should not create core permission mapping with duplicate name', (done) => {
    const createCoreMapping = {
      name: corePermissionName,
    };
    chai.request(server)
      .post('/api/v1/core_permissions_mapping')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createCoreMapping)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create core permission mapping with wrong end point', (done) => {
    const element = 'alert';
    const coreMappingName = generateRandomCoreMapping(element);
    const createCoreMapping = {
      name: coreMappingName,
    };
    chai.request(server)
      .post('/api/v1/corepermissions_mapping')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createCoreMapping)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not create core permission mapping without auth', (done) => {
    const element = 'alert';
    const coreMappingName = generateRandomCoreMapping(element);
    const createCoreMapping = {
      name: coreMappingName,
    };
    chai.request(server)
      .post('/api/v1/core_permissions_mapping')
      .set('x-company-code', global.companieCode)
      .send(createCoreMapping)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not create core permission mapping with wrong company id', (done) => {
    const element = 'alert';
    const coreMappingName = generateRandomCoreMapping(element);
    const createCoreMapping = {
      name: coreMappingName,
    };
    chai.request(server)
      .post('/api/v1/core_permissions_mapping')
      .set('x-auth-token', global.token)
      .set('x-company-code', '')
      .send(createCoreMapping)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 3 GET ALL CORE PERMISSION MAPPING LIST

describe('/GET Get All Core Mapping List ', () => {
  it('It should get all core permission mapping list', (done) => {
    chai.request(server)
      .get('/api/v1/core_permissions_mapping')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 4 DELETE CORE PERMISSION MAPPING

describe('/DELETE Delete Core Permission Mapping', () => {
  it('It should not delete core permission mapping with wrong end point', (done) => {
    chai.request(server)
      .delete(`/api/v1/corepermissions_mapping/${corePermissionId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not delete core permission mapping without auth', (done) => {
    chai.request(server)
      .delete(`/api/v1/core_permissions_mapping/${corePermissionId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should delete core permission mapping', (done) => {
    chai.request(server)
      .delete(`/api/v1/core_permissions_mapping/${corePermissionId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should delete core permission mapping with deleted id', (done) => {
    chai.request(server)
      .delete(`/api/v1/core_permissions_mapping/${corePermissionId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 4 CREATE CORE PERMISSION MAPPING
describe('/POST Create Core Permission Mapping', () => {
  it('It should create core permission mapping', (done) => {
    const element = 'alert';
    const coreMappingName = generateRandomCoreMapping(element);
    const createCoreMapping = {
      name: coreMappingName,
    };
    chai.request(server)
      .post('/api/v1/core_permissions_mapping')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(createCoreMapping)
      .end((err, res) => {
        global.rootCorePermissionMappingId1 = res.body.data.id;
        global.rootCorePermissionMappingName = res.body.data.name;
        res.should.have.status(200);
        done();
      });
  });
});
