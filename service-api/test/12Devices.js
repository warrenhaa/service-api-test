const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');
const { expect } = require('chai');

const { describe } = mocha;
const { it } = mocha;

const server = require('../dist-server/app');

chai.use(chaiHttp);
chai.should();

describe('/GET Not Get All devices', () => {
  it('It should not get all devices - Empty devices', (done) => {
    chai.request(server)
      .get('/api/v1/devices')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should get linked devices of a location', (done) => {
    chai.request(server)
      .get(`/api/v1/devices/location/${global.rootLocationSiteId2}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not get all devices without auth', (done) => {
    chai.request(server)
      .get('/api/v1/devices')
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});

describe('/POST not create device', () => {
  const device = {
    device_code: 'ST921WF-001E5E02C002',
  };
  it('It should not create device without auth', (done) => {
    chai.request(server)
      .post('/api/v1/devices')
      .set('x-company-code', global.companieCode)
      .send(device)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  const deviceDetails = {
    device_code: 'ST921WF-001E5E02C002',
    location_id: '2a1443a6-6d25-4f6d-b568-c35f4eaa7fbe',
  };
  it('It should not create device linked to non-existing location', (done) => {
    chai.request(server)
      .post('/api/v1/devices')
      .set('x-company-code', global.companieCode)
      .set('x-auth-token', global.token)
      .send(deviceDetails)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

describe('/POST not create device character limit', () => {
  const device = {
    device_code: 'ST921WF-001E5E02C002333333333333333333333333333333333333333333334444444444444444444444444444444444666666666666677777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777788888888888888888888888888888888888888888',
  };
  it('It should not create device without auth', (done) => {
    chai.request(server)
      .post('/api/v1/devices')
      .set('x-company-code', global.companieCode)
      .set('x-auth-token', global.token)
      .send(device)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

describe('/POST create device', () => {
  const deviceOne = {
    device_code: 'ST921WF-001E5E02C001',
  };
  const deviceTwo = {
    device_code: 'ST921WF-001E5E02C002',
  };
  it('It should create device', (done) => {
    chai.request(server)
      .post('/api/v1/devices')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(deviceOne)
      .end((err, res) => {
        res.should.have.status(200);
        global.deviceOneId = res.body.data.id;
        expect(res.body.data)
          .to.be.an.instanceof(Object)
          .and.that.includes.all.keys(['id', 'company_id', 'device_code']);
        global.deviceOneId = res.body.data.id;
        done();
      });
  });
  it('It should not create device with same device_code', (done) => {
    chai.request(server)
      .post('/api/v1/devices')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(deviceOne)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });

  it('It should create device with different device_code', (done) => {
    chai.request(server)
      .post('/api/v1/devices')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(deviceTwo)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

describe('/GET Get All devices', () => {
  it('It should get device', (done) => {
    chai.request(server)
      .get('/api/v1/devices')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

describe('/GET Get All devices', () => {
  it('It should get device', (done) => {
    chai.request(server)
      .get('/api/v1/devices')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

describe('/UPDATE link a device to a location', () => {
  it('It should not link device to a location without auth', (done) => {
    const location = {
      location_id: global.rootLocationSiteId2,
    };
    chai.request(server)
      .put(`/api/v1/devices/${global.deviceOneId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(location)
      .end((err, res) => {
        res.should.have.status(200);
        global.deviceLinkedLocationId = res.body.data.location_id;
        done();
      });
  });

  it('It should not link invalid device to a location', (done) => {
    const location = {
      location_id: global.rootLocationSiteId2,
    };
    const invalidDeviceId = 'b31b1d69-9797-4f0c-b28e-c501f3eecadg';
    chai.request(server)
      .put(`/api/v1/devices/${invalidDeviceId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(location)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should link device to a valid location', (done) => {
    const location = {
      location_id: global.rootLocationSiteId2,
    };
    chai.request(server)
      .put(`/api/v1/devices/${global.deviceOneId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(location)
      .end((err, res) => {
        res.should.have.status(200);
        global.deviceLinkedLocationId = res.body.data.location_id;
        done();
      });
  });

  it('It should not link non existing device to a valid location', (done) => {
    const location = {
      gateway_id: global.rootLocationSiteId2,
    };
    chai.request(server)
      .put('/api/v1/devices/0488f9ee-f1bb-413c-80ee-e65b2b7c8ab')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(location)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should get location detail of a linked device', (done) => {
    chai.request(server)
      .get(`/api/v1/locations/${global.deviceLinkedLocationId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  const locationInvalid = {
    location_id: '6ffd7e61-5dd4-4117-8fe9-2b739d9feece',
  };

  it('It should not link a device to a non-existing location', (done) => {
    chai.request(server)
      .put(`/api/v1/devices/${global.deviceOneId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationInvalid)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });

  const locationUnlink = {
    location_id: null,
  };
  it('It should unlink device from a location', (done) => {
    chai.request(server)
      .put(`/api/v1/devices/${global.deviceOneId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationUnlink)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body.data).to.be.an.instanceof(Object)
          .and.that.includes.all.keys(['id', 'company_id', 'device_code', 'location_id']);
        expect(res.body.data).to.have.deep.property('location_id', null);
        done();
      });
  });
});

describe('/UPDATE link a device to a location', () => {
  it('It should link device to a location', (done) => {
    const location = {
      location_id: global.rootLocationSiteId2,
    };
    chai.request(server)
      .put(`/api/v1/devices/${global.deviceOneId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(location)
      .end((err, res) => {
        res.should.have.status(200);
        global.deviceLinkedLocationId = res.body.data.location_id;
        done();
      });
  });

  it('It should get linked devices of a location', (done) => {
    chai.request(server)
      .get(`/api/v1/devices/location/${global.deviceLinkedLocationId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body.data).to.be.an.instanceof(Array);
        done();
      });
  });

  it('It should get location detail of a linked device', (done) => {
    chai.request(server)
      .get(`/api/v1/locations/${global.deviceLinkedLocationId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  const locationInvalid = {
    location_id: 'b31b1d69-9797-4f0c-b28e-c501f3eecadg',
  };
  it('It should not link a device to a non-existing location', (done) => {
    chai.request(server)
      .put(`/api/v1/devices/${global.deviceOneId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationInvalid)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });

  const locationUnlink = {
    location_id: null,
  };
  it('It should unlink device from a location', (done) => {
    chai.request(server)
      .put(`/api/v1/devices/${global.deviceOneId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(locationUnlink)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body.data).to.be.an.instanceof(Object)
          .and.that.includes.all.keys(['id', 'company_id', 'device_code', 'location_id']);
        expect(res.body.data).to.have.deep.property('location_id', null);
        done();
      });
  });
});

describe('/POST create a gateway device', () => {
  it('It should create a gateway device', (done) => {
    const deviceOne = {
      device_code: 'ST921GW-001E5E02C001',
      type: 'gateway',
      gateway_id: null,
    };
    chai.request(server)
      .post('/api/v1/devices')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(deviceOne)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body.data)
          .to.be.an.instanceof(Object)
          .and.that.includes.all.keys(['id', 'company_id', 'device_code', 'gateway_id']);
        expect(res.body.data.gateway_id).to.equal(null);
        global.deviceGatewayId = res.body.data.id;
        done();
      });
  });
  it('It should create a thermostat device', (done) => {
    const deviceThermostat = {
      device_code: 'ST921TH-001E5E02C002',
    };
    chai.request(server)
      .post('/api/v1/devices')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(deviceThermostat)
      .end((err, res) => {
        res.should.have.status(200);
        global.deviceOneId = res.body.data.id;
        expect(res.body.data)
          .to.be.an.instanceof(Object)
          .and.that.includes.all.keys(['id', 'company_id', 'device_code', 'gateway_id']);
        global.deviceThermostatId = res.body.data.id;
        done();
      });
  });
  it('It should not create gateway device with same device_code', (done) => {
    const deviceThermostat = {
      device_code: 'ST921TH-001E5E02C002',
    };
    chai.request(server)
      .post('/api/v1/devices')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(deviceThermostat)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

describe('/UPDATE link a device to a gateway', () => {
  it('It should not link device with incomplete id ', (done) => {
    const gateway = { gateway_id: global.deviceGatewayId };
    const invalidId = 'b7c01889-644c-450f-b936-3cbda1724a';
    chai.request(server)
      .put(`/api/v1/devices/${invalidId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(gateway)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should link device to a gateway', (done) => {
    const gateway = { gateway_id: global.deviceGatewayId };
    chai.request(server)
      .put(`/api/v1/devices/${global.deviceThermostatId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(gateway)
      .end((err, res) => {
        res.should.have.status(200);
        global.deviceLinkedLocationId = res.body.data.location_id;
        done();
      });
  });

  it('It should get  all devices under a gateway', (done) => {
    chai.request(server)
      .get(`/api/v1/devices?gateway_id=${global.deviceGatewayId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body.data).to.be.an.instanceof(Array);
        done();
      });
  });

  it('It should not get  devices under invalid gateway', (done) => {
    chai.request(server)
      .get('/api/v1/devices?gateway_id=351db4af-4ee2-4dc6-b0f0-5abdd1e54c0d')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('It should unlink device from a gateway', (done) => {
    const gateway = { gateway_id: null };
    chai.request(server)
      .put(`/api/v1/devices/${global.deviceThermostatId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(gateway)
      .end((err, res) => {
        res.should.have.status(200);
        global.deviceLinkedLocationId = res.body.data.location_id;
        done();
      });
  });

  it('It should set status of device to active', (done) => {
    const status = { status: 'active' };
    chai.request(server)
      .put(`/api/v1/devices/${global.deviceThermostatId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(status)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('It should not get  devices under invalid gateway', (done) => {
    chai.request(server)
      .get('/api/v1/devices?gateway_id=351db4af-4ee2-4dc6-b0f0-5abdd1e54c0d')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

describe('/DELETE delete devices', () => {
  it('It should get a thermostat device', (done) => {
    chai.request(server)
      .get(`/api/v1/devices/${global.deviceThermostatId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  const invalidDeviceId = 'b31b1d69-9797-4f0c-b28e-c501f3eecadg';

  it('It should not delete an invalid device', (done) => {
    chai.request(server)
      .delete(`/api/v1/devices/${invalidDeviceId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });

  it('It should delete a gateway device', (done) => {
    chai.request(server)
      .delete(`/api/v1/devices/${global.deviceGatewayId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('It should get all device under gateway', (done) => {
    chai.request(server)
      .get(`/api/v1/devices?gateway_id=${global.deviceGatewayId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('It should delete a thermostat device', (done) => {
    chai.request(server)
      .delete(`/api/v1/devices/${global.deviceThermostatId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('It should not get  a deleted thermostat device', (done) => {
    chai.request(server)
      .get(`/api/v1/devices/${global.deviceThermostatId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('It should not get all device types', (done) => {
    chai.request(server)
      .get('/api/v1/devices/types')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});
