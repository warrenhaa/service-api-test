const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;

const server = require('../dist-server/app');

chai.use(chaiHttp);
chai.should();

describe('/GET Get All Activity Logs', () => {
  it('It should get all activity logs', (done) => {
    chai.request(server)
      .get('/api/v1/activity_logs')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
