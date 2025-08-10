const uuid = require('uuid').v4;

module.exports = {
  up: async (queryInterface) => queryInterface.bulkInsert('template_contents', [{
    id: uuid(),
    key: 'OccupantInviteDeleted',
    language: 'en-US',
    email_config: `{
      "body": "Welcome, {{old.inviter_email}} has cancelled your invitation to new smart home as occupant. <br/> <br/> You have no access to: <br/> <b> {{old.access_to}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}} ",
      "subject": "Invitation Cancelled"
    }`,
    sms_config: `{
      "body": "Welcome, {{old.inviter_email}} has cancelled your invitation to new smart home as occupant. <br/> <br/> You have no access to: <br/> <b> {{old.access_to}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}} ",
      "subject": "Invitation Cancelled"
    }`,
    notification_config: `{
      "body": "Welcome, {{old.inviter_email}} has cancelled your invitation to new smart home as occupant. <br/> <br/> You have no access to: <br/> <b> {{old.access_to}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}} ",
      "subject": "Invitation Cancelled"
    }`,
    created_at: new Date(),
    updated_at: new Date(),
    type: 'activity',
  }], {}),
  down: (queryInterface) => queryInterface.bulkDelete('template_contents', null, {}),
};
