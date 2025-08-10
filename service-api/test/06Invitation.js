/* eslint-disable no-undef */
// let server = require("../server/routes/invitation")

const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;

const server = require('../dist-server/app');

let initialMailId = null;

chai.use(chaiHttp);
chai.should();

let inviteId = null;

function generateEmail(element1, element2) {
  const date2 = Date.now();
  const email = element1 + date2 + element2;
  return email;
}

// 1 GET EMPTY INVITATIONS
describe('/GET invitations', () => {
  it('It should get empty invitations', (done) => {
    chai
      .request(server)
      .get('/api/v1/invitations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not get invitations wrong endpoint', (done) => {
    chai
      .request(server)
      .get('/api/v1/invitation')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 2 POST INVITATION
describe('/POST invitations', () => {
  it('It should send a invitation ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);

    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },

    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        global.inviteId = res.body.data.id;
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        res.body.data.should.have.property('email').eql(mailId);
        done();
      });
  });
  it('It should send a invitation ', (done) => {
    const mailId = process.env.TEST_MAIL || 'naveen.pathiyil@hubblehome.com';

    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },

    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        global.inviteTest = res.body.data.id;
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        res.body.data.should.have.property('email').eql(mailId);
        done();
      });
  });
});

describe('/Update invitation Permission', () => {
  it('It should not update an invitation permission ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);
    const corePermissionName = global.rootCorePermissionMappingName;
    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
      },

    };
    invitation.core_permissions = {};
    invitation.core_permissions[corePermissionName] = ['read', 'delete'];
    chai.request(server)
      .put('/api/v1/invitations/edit_permissions/7f13892e-4b4d-464f-9961-323d41d9a327')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should update an invitation permission ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);
    const corePermissionName = global.rootCorePermissionMappingName;
    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
      },

    };
    invitation.core_permissions = {};
    invitation.core_permissions[corePermissionName] = ['read', 'delete'];
    chai.request(server)
      .put(`/api/v1/invitations/edit_permissions/${global.inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        inviteId = res.body.data.id;
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        done();
      });
  });
});

// 3 POST INVITATION WITHOUT AUTH
describe('/POST invitations without Auth', () => {
  it('It should not send a invitation ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);

    const invitation = {
      email: mailId,
    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.a('object');
        done();
      });
  });
});

// 4 GET ALL INVITATIONS
describe('/GET invitations', () => {
  it('It should get all invitations', (done) => {
    chai
      .request(server)
      .get('/api/v1/invitations')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.be.a('array');
        done();
      });
  });
});

// 5 ACCEPT INVITATION
describe('/PUT  Accept Invitations', () => {
  it('It should not accept invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/accept/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  const acceptId = '61521b21-8e41-4bdd-9220-62c0f0d8a1fe';
  it('It should not accept invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/accept/${acceptId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});
// 6 ACCEPT INVITATION WITH ALREADY ACCEPTED INVITE ID
describe('/PUT  Accept Invitations', () => {
  it('It should not accept invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/accept/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 7 EXPIRE THE INVITATION WITH ALREADY ACCEPTED INVITE ID
describe('/PUT  Expire Invitations', () => {
  it('It should expire an invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/expire/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 8 POST INVITATION
describe('/POST invitations', () => {
  it('It should send a invitation ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);

    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },

    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        inviteId = res.body.data.id;
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        res.body.data.should.have.property('email').eql(mailId);
        done();
      });
  });
});

// 9 INVITATION EXPIRE
describe('/PUT  Expire Invitations', () => {
  it('It should expire an invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/expire/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  const expireId = '43de4cd7-40e7-473a-a105-552f03ff8f6b';
  it('It should expire an invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/expire/${expireId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 10 EXPIRE INVITATION WITH ALREADY EXPIRE INVITE ID

describe('/PUT  Expire Invitations', () => {
  it('It should expire an invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/expire/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 11 ACCEPT INVITATION WITH ALREADY EXPIRE INVITE ID
describe('/PUT  Accept Invitations', () => {
  it('It should not accept invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/accept/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 12 RESEND INVITATION
describe('/POST  Resend Invitations', () => {
  it('It should resend invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/resend/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 13 ACCEPT INVITATION
describe('/PUT  Accept Invitations', () => {
  it('It should accept invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/accept/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not update already accepted invitation permission ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);
    const corePermissionName = global.rootCorePermissionMappingName;
    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
      },

    };
    invitation.core_permissions = {};
    invitation.core_permissions[corePermissionName] = ['read', 'delete'];
    chai.request(server)
      .put(`/api/v1/invitations/edit_permissions/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

// 14 RESEND INVITATION WITH ALREADY ACCEPTED INVITE ID
describe('/POST  Resend Invitations', () => {
  it('It should resend invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/resend/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 15 POST INVITATION
describe('/POST invitations', () => {
  it('It should send a invitation ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);

    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },

    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        inviteId = res.body.data.id;
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        res.body.data.should.have.property('email').eql(mailId);
        done();
      });
  });
});

// 15 POST INVITATION USER TO DELETE
describe('/POST invitations', () => {
  it('It should send a invitation ', (done) => {
    const element1 = 'delete';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);

    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },

    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        global.deleteInviteId = res.body.data.id;
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        res.body.data.should.have.property('email').eql(mailId);
        done();
      });
  });
});

// 16 INVITATION EXPIRE
describe('/PUT  Expire Invitations', () => {
  it('It should expire an invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/expire/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not expire an invitation ', (done) => {
    const expireId = '61521b21-8e41-4bdd-9220-62c0f0d8a1fe';
    chai.request(server)
      .put(`/api/v1/invitations/expire/${expireId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 17 RESEND INVITATION
describe('/POST  Resend Invitations', () => {
  it('It should resend invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/resend/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not resend invitation ', (done) => {
    const resendId = 'b7c01889-644c-450f-b936-3cbda1724a9a';
    chai.request(server)
      .put(`/api/v1/invitations/resend/${resendId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not resend invitation with incomplete id ', (done) => {
    const resendId = 'b7c01889-644c-450f-b936-3cbda1724a';
    chai.request(server)
      .put(`/api/v1/invitations/resend/${resendId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

// 18 RESEND THE INVITATION WITH ALREADY RESENT INVITE ID
describe('/POST  Resend Invitations', () => {
  it('It not should resend invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/resend/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 19  DELETE INVITATION
describe('/DELETE invitations', () => {
  it('It should delete a invitation ', (done) => {
    chai.request(server)
      .delete(`/api/v1/invitations/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not expire an invitation ', (done) => {
    const deleteId = 'e3c638c8-36c9-4e1d-b25d-f6cd022237bc';
    chai.request(server)
      .delete(`/api/v1/invitations/${deleteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not  an invitation with incomplete id ', (done) => {
    const wrongDeleteId = 'e3c638c8-36c9-4e1d-b25d-f6cd022237';
    chai.request(server)
      .delete(`/api/v1/invitations/${wrongDeleteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

// 20 POST INVITATION
describe('/POST invitations', () => {
  it('It should send a invitation ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);

    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },

    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        inviteId = res.body.data.id;
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        res.body.data.should.have.property('email').eql(mailId);
        done();
      });
  });
});

// 21 INVITATION EXPIRE
describe('/PUT  Expire Invitations', () => {
  it('It should expire an invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/expire/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not expire an invitation', (done) => {
    const expireId = '61521b21-8e41-4bdd-9220-62c0f0d8a1fe';
    chai.request(server)
      .put(`/api/v1/invitations/expire/${expireId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 22 DELETE THE INVITATION ALREADY EXPIRE
describe('/DELETE invitations', () => {
  it('It should delete a invitation ', (done) => {
    chai.request(server)
      .delete(`/api/v1/invitations/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 23 POST INVITATION
describe('/POST invitations', () => {
  it('It should send a invitation ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);

    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },

    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        inviteId = res.body.data.id;
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        res.body.data.should.have.property('email').eql(mailId);
        done();
      });
  });
});

// 24 ACCEPT INVITATION
describe('/PUT  Accept Invitations', () => {
  it('It should accept invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/accept/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should accept invitation ', (done) => {
    const wrongAcceptId = '61521b21-8e41-4bdd-9220-62c0f0d8a1f';
    chai.request(server)
      .put(`/api/v1/invitations/accept/${wrongAcceptId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

// 25 DELETE THE ACCEPTED INVITATION
describe('/DELETE invitations', () => {
  it('It should delete a invitation ', (done) => {
    chai.request(server)
      .delete(`/api/v1/invitations/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// 26 DELETE INVITE ID ALREADY DELETED
describe('/DELETE invitations', () => {
  it('It should delete a invitation ', (done) => {
    chai.request(server)
      .delete(`/api/v1/invitations/${inviteId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// 27 POST INVITATION
describe('/POST invitations', () => {
  it('It should send a invitation ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);

    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },

    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        global.inviteExId = res.body.data.id;
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        res.body.data.should.have.property('email').eql(mailId);
        done();
      });
  });
});
// 28 INVITATION EXPIRE
describe('/PUT  Expire Invitations', () => {
  it('It should expire an invitation ', (done) => {
    chai.request(server)
      .put(`/api/v1/invitations/expire/${global.inviteExId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('It should not expire an invitation with incomplete id ', (done) => {
    const wrongExpireId = '61521b21-8e41-4bdd-9220-62c0f0d8a1f';
    chai.request(server)
      .put(`/api/v1/invitations/expire/${wrongExpireId}`)
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
});

// 29 INVITE USER

describe('/POST invitations', () => {
  it('It should send a invitation ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);
    initialMailId = mailId;
    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },
    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        res.should.have.status(200);
        global.invitationId = res.body.data.id;
        res.body.data.should.be.a('object');
        done();
      });
  });
  it('It should not send a invitation with out auth ', (done) => {
    const invitation = {
      email: initialMailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },

    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('It should not send a invitation duplicate mailId ', (done) => {
    const invitation = {
      email: initialMailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },

    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-company-code', global.companieCode)
      .set('x-auth-token', global.token)
      .send(invitation)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should not send a invitation wrong end point ', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);
    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },

    };
    chai.request(server)
      .post('/api/v1/invitation/send')
      .set('x-company-code', global.companieCode)
      .set('x-auth-token', global.token)
      .send(invitation)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not send a invitation @ missing in email id', (done) => {
    const element1 = 'rubye';
    const element2 = 'mailinator.com';
    const mailId = generateEmail(element1, element2);
    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },
    };
    chai.request(server)
      .post('/api/v1/invitation/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('It should not send a invitation with empty body', (done) => {
    const invitation = {};
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });
  it('It should send a invitation with out permissions body', (done) => {
    const element1 = 'rubye';
    const element2 = '@mailinator.com';
    const mailId = generateEmail(element1, element2);
    const invitation = {
      email: mailId,
      permissions: {
        site_permissions: [
          global.rootLocationSiteId1,
        ],
        core_permission_mapping_id: global.rootCorePermissionMappingId1,
      },
    };
    chai.request(server)
      .post('/api/v1/invitations/send')
      .set('x-auth-token', global.token)
      .set('x-company-code', global.companieCode)
      .send(invitation)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
