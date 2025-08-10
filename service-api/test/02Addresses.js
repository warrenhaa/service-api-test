const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;

const server = require('../dist-server/app');

chai.use(chaiHttp);
chai.should();

let addressId = null;

describe('/GET GET ADDRESS', () => {
  it('It not should get addresses', (done) => {
    const wrongCompanyCode = '44ec9f05-038d-44b6-ad80-425bc6104184';
    chai.request(server)
      .get('/api/v1/adresses')
      .set('x-auth-token', global.token)
      .set('x-company-code', wrongCompanyCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It not should get addresses with wrong end point', (done) => {
    chai.request(server)
      .get('/api/v1/adresse')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It not should get addresses without auth', (done) => {
    chai.request(server)
      .get('/api/v1/adresses')
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});

// 3 CREATE ADDRESS

describe('/POST Create Address', () => {
  it('It should create addresses', (done) => {
    const address = {
      line_1: 'Motorola building 2',
      line_2: 'Bagmane',
      line_3: 'Indiranagar',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/adresses')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(address)
      .end((err, res) => {
        addressId = res.body.data.id;
        res.should.have.status(200);
        done();
      });
  });
  it('It should  create addresses with empty body', (done) => {
    const address = {
    };
    chai.request(server)
      .post('/api/v1/adresses')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(address)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not create addresses with wrong end point', (done) => {
    const address = {
      line_1: 'Motorola building 2',
      line_2: 'Bagmane',
      line_3: 'Indiranagar',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/adresse')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(address)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not create addresses without auth ', (done) => {
    const address = {
      line_1: 'Motorola building 2',
      line_2: 'Bagmane',
      line_3: 'Indiranagar',
      city: 'Bengaluru',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .post('/api/v1/adresses')
      .set('x-company-code', global.companieCode)
      .send(address)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});

// 4 GET ALL ADDRESS

describe('/GET GET ADDRESS', () => {
  it('It should get addresses', (done) => {
    chai.request(server)
      .get('/api/v1/adresses')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It not should get addresses with wrong end point', (done) => {
    chai.request(server)
      .get('/api/v1/adresse')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It not should get addresses without auth', (done) => {
    chai.request(server)
      .get('/api/v1/adresses')
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});

// 5 GET ADDRESS BASE ON ID

describe('/GET GET ADDRESS BY ID', () => {
  it('It should get addresses', (done) => {
    chai.request(server)
      .get(`/api/v1/adresses/${addressId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It not should get addresses with worng end point', (done) => {
    chai.request(server)
      .get(`/api/v1/adresse/${addressId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It not should get addresses without auth', (done) => {
    chai.request(server)
      .get(`/api/v1/adresses/${addressId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not get addresses with incomplete id', (done) => {
    const wrongId = 'd224ecb1-4b56-4269-98ec-92a58c36208';
    chai.request(server)
      .get(`/api/v1/adresses/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should get addresses with incorrect id', (done) => {
    const wrongId = 'bf29c164-d846-4678-9ab7-0eb80c8372ad';
    chai.request(server)
      .get(`/api/v1/adresses/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 6 UPDDATE THE ADDRESS

describe('/GET GET ADDRESS BY ID', () => {
  it('It should update addresses', (done) => {
    const updateAddress = {
      line_1: 'conviva APAC',
      line_2: 'Connected',
      line_3: 'LTD',
      city: 'Bengaluru,HSR,1st',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .put(`/api/v1/adresses/${addressId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(updateAddress)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not update addresses with wrong end point ', (done) => {
    const updateAddress = {
      line_1: 'conviva APAC',
      line_2: 'Connected',
      line_3: 'LTD',
      city: 'Bengaluru,HSR,1st',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .put(`/api/v1/adresse/${addressId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(updateAddress)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not update addresses without auth ', (done) => {
    const updateAddress = {
      line_1: 'conviva APAC',
      line_2: 'Connected',
      line_3: 'LTD',
      city: 'Bengaluru,HSR,1st',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    chai.request(server)
      .put(`/api/v1/adresses/${addressId}`)
      .send(updateAddress)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not update addresses with empty body', (done) => {
    chai.request(server)
      .put(`/api/v1/adresses/${addressId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not update addresses with wrong id', (done) => {
    const updateAddress = {
      line_1: 'conviva APAC',
      line_2: 'Connected',
      line_3: 'LTD',
      city: 'Bengaluru,HSR,1st',
      state: 'KA',
      country: 'India',
      zip_code: '560068',
      geo_location: {},
      total_area: 123.345,
    };
    const wrongAddressId = '58dc545a-fc45-4e4b-9c9f-1f0284cbada6';
    chai.request(server)
      .put(`/api/v1/adresses/${wrongAddressId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(updateAddress)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 7 DELETE THE ADDRESS

describe('/DELETE Delete Address', () => {
  it('It not should get addresses with worng end point', (done) => {
    chai.request(server)
      .delete(`/api/v1/adresse/${addressId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It not should get addresses without auth', (done) => {
    chai.request(server)
      .delete(`/api/v1/adresses/${addressId}`)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should get addresses', (done) => {
    const wrongId = 'd224ecb1-4b56-4269-98ec-92a58c36';
    chai.request(server)
      .delete(`/api/v1/adresses/${wrongId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should delete addresses', (done) => {
    chai.request(server)
      .delete(`/api/v1/adresses/${addressId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not delete addresses already deleted id', (done) => {
    chai.request(server)
      .delete(`/api/v1/adresses/${addressId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});
