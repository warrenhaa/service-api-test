const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const server = require('../dist-server/app');

chai.use(chaiHttp);
chai.should();

let locationSiteId = null;
let locationSiteName = null;
let locationBuildingName = null;
let locationBuildingId = null;

function generateRandomLocationType(element) {
  const random = element + Math.random();
  return random;
}
// 1 EMPTY ALL LOCATION TYPE LIST

describe('/GET Get All Location List', () => {
  it('It should not get all location list', (done) => {
    chai.request(server)
      .get('/api/v1/locations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 2 CREATE LOCATION

describe('/POST Create Location', () => {
  it('It should create location', (done) => {
    const element = 'Ruby site';
    const createLocationType = generateRandomLocationType(element);
    const locationType = {
      name: createLocationType,
      notes: 'test',
      type_id: global.rootSiteId,
      container_id: null,
      line_1: 'HSR layout',
      line_2: 'Near School',
      line_3: 'HSR',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/locations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        locationSiteName = res.body.data.name;
        locationSiteId = res.body.data.id;
        res.should.have.status(200);
        done();
      });
  });
  it('It should create location with duplicate name field', (done) => {
    const locationType = {
      name: locationSiteName,
      notes: 'test',
      type_id: global.rootSiteId,
      container_id: null,
      line_1: 'HSR layout',
      line_2: 'Near School',
      line_3: 'HSR',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/locations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not create location without container id', (done) => {
    const element = 'Ruby site';
    const createLocationType = generateRandomLocationType(element);
    const locationType = {
      name: createLocationType,
      notes: 'test',
      type_id: global.rootSiteId,
      line_1: 'HSR layout',
      line_2: 'Near School',
      line_3: 'HSR',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/locations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create location with only name', (done) => {
    const element = 'Ruby site';
    const createLocationType = generateRandomLocationType(element);
    const locationType = {
      name: createLocationType,
    };
    chai.request(server)
      .post('/api/v1/locations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not create location with wrong endpoint', (done) => {
    const element = 'Ruby site';
    const createLocationType = generateRandomLocationType(element);
    const locationType = {
      name: createLocationType,
      notes: 'test',
      type_id: global.rootSiteId,
      container_id: null,
      line_1: 'HSR layout',
      line_2: 'Near School',
      line_3: 'HSR',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/location')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not create location  without auth', (done) => {
    const element = 'Ruby site';
    const createLocationType = generateRandomLocationType(element);
    const locationType = {
      name: createLocationType,
      notes: 'test',
      type_id: global.rootSiteId,
      container_id: null,
      line_1: 'HSR layout',
      line_2: 'Near School',
      line_3: 'HSR',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/locations')
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not create location  without company_name', (done) => {
    const element = 'Ruby site';
    const createLocationType = generateRandomLocationType(element);
    const locationType = {
      name: createLocationType,
      notes: 'test',
      type_id: global.rootSiteId,
      container_id: null,
      line_1: 'HSR layout',
      line_2: 'Near School',
      line_3: 'HSR',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/locations')
      .set('x-auth-token', global.token)
      .set('x-company-code', '')
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not create location with empty body', (done) => {
    const locationType = {};
    chai.request(server)
      .post('/api/v1/locations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should create location building', (done) => {
    const element = 'Ruby builidng';
    const createLocationType = generateRandomLocationType(element);
    const locationType = {
      name: createLocationType,
      notes: 'test',
      type_id: global.rootBuildingId,
      container_id: locationSiteId,
      line_1: 'HSR layout',
      line_2: 'Near School',
      line_3: 'HSR',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/locations')
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
  it('It should create location type building with duplicate name', (done) => {
    const locationType = {
      name: locationBuildingName,
      notes: 'test',
      type_id: global.rootBuildingId,
      container_id: locationSiteId,
      line_1: 'HSR layout',
      line_2: 'Near School',
      line_3: 'HSR',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/locations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 3 GET LOCATION  WITH ID

describe('/GET Get ', () => {
  it('It should get location site by id', (done) => {
    chai.request(server)
      .get(`/api/v1/locations/${locationSiteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should get location building by id', (done) => {
    chai.request(server)
      .get(`/api/v1/locations/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property('address');
        res.body.data.should.have.property('location_type');
        done();
      });
  });
  it('It should not get location building by id with wrong id', (done) => {
    const wrongId = 'baabeb10-b030-4c97-9127-e9b07bb9d41a';
    chai.request(server)
      .get(`/api/v1/locations/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not get location building by id without auth', (done) => {
    chai.request(server)
      .get(`/api/v1/locations/${locationBuildingId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not get location building by id without company id', (done) => {
    chai.request(server)
      .get(`/api/v1/locations/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', '')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not get location building by id with incomplete id', (done) => {
    const wrongId = 'baabeb10-b030-4c97-9127-e9b07bb9d41';
    chai.request(server)
      .get(`/api/v1/locations/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

// 4 GET ALL THE LOCATION LIST
describe('/GET Get All Location Types', () => {
  it('It should get all location list', (done) => {
    chai.request(server)
      .get('/api/v1/locations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 5 UPDATE THE LOCATION  LIST

describe('/PUT Get All Location Types', () => {
  it('It should update location building', (done) => {
    const updateLocation = {
      name: 'Ruby latest building',
    };
    chai.request(server)
      .put(`/api/v1/locations/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(updateLocation)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should update the location without body', (done) => {
    chai.request(server)
      .put(`/api/v1/locations/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not update location building without auth', (done) => {
    const updateLocation = {
      name: 'Ruby latest building',
    };
    chai.request(server)
      .put(`/api/v1/locations/${locationBuildingId}`)
      .set('x-company-code', global.companieCode)
      .send(updateLocation)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not update location building wrong end point', (done) => {
    const updateLocation = {
      name: 'Ruby latest building',
    };
    chai.request(server)
      .put(`/api/v1/location/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(updateLocation)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not update location building with incomplete id', (done) => {
    const updateLocation = {
      name: 'Ruby latest building',
    };
    const wrongId = '3c05fd4d-0c7c-4f17-85c7-cb8a677798';
    chai.request(server)
      .put(`/api/v1/locations/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(updateLocation)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not update location building with wrong id', (done) => {
    const updateLocation = {
      name: 'Ruby latest building',
    };
    const wrongId = '3c05fd4d-0c7c-4f17-85c7-cb8a677798cd';
    chai.request(server)
      .put(`/api/v1/locations/${wrongId}`)
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

describe('/DELETE Delete the location', () => {
  it('It should not delete location building with wrong endpoint', (done) => {
    chai.request(server)
      .delete(`/api/v1/location/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not delete location building without auth', (done) => {
    chai.request(server)
      .delete(`/api/v1/location/${locationBuildingId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not delete location building without company id', (done) => {
    chai.request(server)
      .delete(`/api/v1/locations/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', '')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not delete location building with incomplete id', (done) => {
    const wrongId = 'b2565d9f-c813-46f6-801a-6299de9df44';
    chai.request(server)
      .delete(`/api/v1/locations/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should delete location building', (done) => {
    chai.request(server)
      .delete(`/api/v1/locations/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not delete location building with deleted id', (done) => {
    chai.request(server)
      .delete(`/api/v1/locations/${locationBuildingId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not delete location building with wrong id', (done) => {
    const wrongId = '3c05fd4d-0c7c-4f17-85c7-cb8a677798cd';
    chai.request(server)
      .delete(`/api/v1/locations/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  // site test cases
  it('It should not delete location site with wrong endpoint', (done) => {
    chai.request(server)
      .delete(`/api/v1/location/${locationSiteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not delete location site without auth', (done) => {
    chai.request(server)
      .delete(`/api/v1/locations/${locationSiteId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not delete location site without company id', (done) => {
    chai.request(server)
      .delete(`/api/v1/locations/${locationSiteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', '')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should delete location site', (done) => {
    chai.request(server)
      .delete(`/api/v1/locations/${locationSiteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not delete location type site with deleted id', (done) => {
    chai.request(server)
      .delete(`/api/v1/locations/${locationSiteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 7 CREATE LOCATIONS

describe('/POST Create Location', () => {
  it('It should create location', (done) => {
    const element = 'Ruby site';
    const createLocationType = generateRandomLocationType(element);
    const locationType = {
      name: createLocationType,
      notes: 'test',
      type_id: global.rootSiteId,
      container_id: null,
      line_1: 'HSR layout',
      line_2: 'Near School',
      line_3: 'HSR',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/locations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        global.rootLocationSiteId1 = res.body.data.id;
        res.should.have.status(200);
        done();
      });
  });
  it('It should create location', (done) => {
    const element = 'Ruby site';
    const createLocationType = generateRandomLocationType(element);
    const locationType = {
      name: createLocationType,
      notes: 'test',
      type_id: global.rootSiteId,
      container_id: null,
      line_1: 'HSR layout',
      line_2: 'Near School',
      line_3: 'HSR',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/locations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationType)
      .end((err, res) => {
        global.rootLocationSiteId2 = res.body.data.id;
        res.should.have.status(200);
        done();
      });
  });

  it('It should update location', (done) => {
    const locationDetails = {
      line_1: 'Naveen Test',
      line_2: 'QW',
      city: 'Jebel Ali',
      state: 'Dubai',
      country: 'UAE',
      total_area: '113',
      zip_code: '12312',
      geo_location: {
        lat: '21',
        long: '12.3',
      },
    };
    chai.request(server)
      .put(`/api/v1/locations/${global.rootLocationSiteId2}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationDetails)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
