const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const server = require('../dist-server/app');

chai.use(chaiHttp);
chai.should();

let locationTypeName = null;
let locationTypeId = null;
let locationBuildingName = null;
let locationBuildingId = null;

// 1 EMPTY ALL LOCATION TYPE LIST

describe('/GET Get All Location Types', () => {
  it('It should not get all location type list', (done) => {
    chai.request(server)
      .get('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 2 CREATE LOCATION TYPE SITE

describe('/POST Create Location Type', () => {
  it('It should create location type', (done) => {
    const element = 'site';
    const locationType = {
      name: element,
      container_id: null,
      can_have_devices: false,
      is_address_applicable: true,
      is_location_map_applicable: true,
    };
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        locationTypeName = res.body.data.name;
        locationTypeId = res.body.data.id;
        res.should.have.status(200);
        done();
      });
  });
  it('It should not create location type with duplicate name field', (done) => {
    const locationType = {
      name: locationTypeName,
      container_id: null,
      can_have_devices: false,
      is_address_applicable: true,
      is_location_map_applicable: true,
    };
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create location type without container id', (done) => {
    const element = 'site';
    const locationType = {
      name: element,
      can_have_devices: false,
      is_address_applicable: true,
      is_location_map_applicable: true,
    };
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create location type without container id', (done) => {
    const element = 'site';
    const locationType = {
      name: element,
      can_have_devices: false,
      is_address_applicable: true,
      is_location_map_applicable: true,
    };
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create location type with only name', (done) => {
    const element = 'site';
    const locationType = {
      name: element,
    };
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create location type with wrong endpoint', (done) => {
    const element = 'site';
    const locationType = {
      name: element,
      container_id: null,
      can_have_devices: false,
      is_address_applicable: true,
      is_location_map_applicable: true,
    };
    chai.request(server)
      .post('/api/v1/location_type')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not create location type without auth', (done) => {
    const element = 'site';
    const locationType = {
      name: element,
      container_id: null,
      can_have_devices: false,
      is_address_applicable: true,
      is_location_map_applicable: true,
    };
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not create location type without company_name', (done) => {
    const element = 'site';
    const locationType = {
      name: element,
      container_id: null,
      can_have_devices: false,
      is_address_applicable: true,
      is_location_map_applicable: true,
    };
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', '')
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not create location type with empty body', (done) => {
    const locationType = {};
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should create location type building', (done) => {
    const element = 'builidng';
    const locationType = {
      name: element,
      container_id: locationTypeId,
      can_have_devices: true,
      is_address_applicable: true,
      is_location_map_applicable: true,
    };
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        locationBuildingName = res.body.data.name;
        locationBuildingId = res.body.data.id;
        res.should.have.status(200);
        done();
      });
  });
  it('It should not create location type building with duplicate name', (done) => {
    const locationType = {
      name: locationBuildingName,
      container_id: locationTypeId,
      can_have_devices: true,
      is_address_applicable: true,
      is_location_map_applicable: true,
    };
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

// 3 GET LOCATION TYPE WITH ID
describe('/GET Get ', () => {
  it('It should get location type site by id', (done) => {
    chai.request(server)
      .get(`/api/v1/location_types/${locationTypeId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should get location type building by id', (done) => {
    chai.request(server)
      .get(`/api/v1/location_types/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not get location type building by id with wrong id', (done) => {
    const wrongId = 'baabeb10-b030-4c97-9127-e9b07bb9d41a';
    chai.request(server)
      .get(`/api/v1/location_types/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not get location type building with incomplete id', (done) => {
    const wrongId = 'baabeb10-b030-4c97-9127-e9b07bb9d41';
    chai.request(server)
      .get(`/api/v1/location_types/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });

  it('It should not get location type building by id without auth', (done) => {
    chai.request(server)
      .get(`/api/v1/location_types/${locationBuildingId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not get location type building by id without company id', (done) => {
    chai.request(server)
      .get(`/api/v1/location_types/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', '')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 4 GET ALL THE LOCATION TYPE LIST

describe('/GET Get All Location Types', () => {
  it('It should get all location type list', (done) => {
    chai.request(server)
      .get('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 5 UPDATE THE LOCATION TYPE LIST

describe('/PUT Get All Location Types', () => {
  it('It should update location type building', (done) => {
    const updateLocation = {
      can_have_devices: false,
    };
    chai.request(server)
      .put(`/api/v1/location_types/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(updateLocation)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should update the location list without body', (done) => {
    chai.request(server)
      .put(`/api/v1/location_types/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not update the location list with wrong end point', (done) => {
    const updateLocation = {
      can_have_devices: false,
    };
    chai.request(server)
      .put(`/api/v1/location_type/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(updateLocation)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not update the location list with wrong auth', (done) => {
    const updateLocation = {
      can_have_devices: false,
    };
    chai.request(server)
      .put(`/api/v1/location_types/${locationBuildingId}`)
      .set('x-company-code', global.companieCode)
      .send(updateLocation)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not update the location list with incomplete id', (done) => {
    const updateLocation = {
      can_have_devices: false,
    };
    const wrongId = 'baabeb10-b030-4c97-9127-e9b07bb9d41';
    chai.request(server)
      .put(`/api/v1/location_types/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(updateLocation)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not update the location list with wrong id', (done) => {
    const updateLocation = {
      can_have_devices: false,
    };
    const wrongId = 'baabeb10-b030-4c97-9127-e9b07bb9d41a';
    chai.request(server)
      .put(`/api/v1/location_types/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(updateLocation)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 6 DELETE THE LOCATION TYPE

describe('/DELETE Delete the location types', () => {
  it('It should not delete location type building with wrong endpoint', (done) => {
    chai.request(server)
      .delete(`/api/v1/locationtypes/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not delete location type building without company id', (done) => {
    chai.request(server)
      .delete(`/api/v1/location_types/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', '')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should delete location type building', (done) => {
    chai.request(server)
      .delete(`/api/v1/location_types/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not delete location type building with deleted id', (done) => {
    chai.request(server)
      .delete(`/api/v1/location_types/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not delete location type building  with wrong id', (done) => {
    const wrongId = '3c05fd4d-0c7c-4f17-85c7-cb8a677798cd';
    chai.request(server)
      .delete(`/api/v1/location_types/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not delete location type building with incomplete id', (done) => {
    const wrongId = '3c05fd4d-0c7c-4f17-85c7-cb8a677798c';
    chai.request(server)
      .delete(`/api/v1/location_types/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  // site test cases
  it('It should not delete location type site with wrong endpoint', (done) => {
    chai.request(server)
      .delete(`/api/v1/locationtypes/${locationTypeId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not delete location type site without company id', (done) => {
    chai.request(server)
      .delete(`/api/v1/location_types/${locationTypeId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', '')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should delete location type site', (done) => {
    chai.request(server)
      .delete(`/api/v1/location_types/${locationTypeId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not delete location type site with deleted id', (done) => {
    chai.request(server)
      .delete(`/api/v1/location_types/${locationTypeId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 7 CREATE LOCATION TYPE

describe('/POST Create Location Type', () => {
  it('It should create location type', (done) => {
    const element = 'site';
    const locationType = {
      name: element,
      container_id: null,
      can_have_devices: false,
      is_address_applicable: true,
      is_location_map_applicable: true,
    };
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        global.rootSiteId = res.body.data.id;
        res.should.have.status(200);
        done();
      });
  });
  it('It should create location type building', (done) => {
    const element = 'builidng';
    const locationType = {
      name: element,
      container_id: global.rootSiteId,
      can_have_devices: true,
      is_address_applicable: true,
      is_location_map_applicable: true,
    };
    chai.request(server)
      .post('/api/v1/location_types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        global.rootBuildingId = res.body.data.id;
        res.should.have.status(200);
        done();
      });
  });
});
