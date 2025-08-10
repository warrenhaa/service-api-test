const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;

const server = require('../dist-server/app');

chai.use(chaiHttp);
chai.should();

describe('/GET Get All Activity configs', () => {
  it('It should not get activity configs', (done) => {
    chai.request(server)
      .get('/api/v1/activity_configs')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should create an activity logs', (done) => {
    const activityConfig = {
      entity: 'Locations',
      send_email: true,
      send_sms: true,
    };
    chai.request(server)
      .post('/api/v1/activity_configs')
      .set('x-auth-token', global.token)
      .send(activityConfig)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        global.activityConfigId = res.body.data.id;
        res.should.have.status(200);
        done();
      });
  });
  it('It should get activity configs', (done) => {
    chai.request(server)
      .get('/api/v1/activity_configs')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should delete activity configs', (done) => {
    chai.request(server)
      .delete(`/api/v1/activity_configs/${global.activityConfigId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
