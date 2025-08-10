const uuid = require('uuid').v4;

module.exports = {
  up: async (queryInterface) => queryInterface.bulkInsert('template_contents', [{
    id: uuid(),
    key: 'OccupantCheckedOut',
    language: 'en-US',
    email_config: `{
      "body": "Welcome, {{old.inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{old.access_to}}. </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{old.expires_at}} <br/> <br/> If you have any questions please contact your administrator at {{company_link}}",
      "subject": "CheckOut Update"
    }`,
    sms_config: `{
      "body": "Welcome, {{old.inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{old.access_to}}. </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{old.expires_at}} <br/> <br/> If you have any questions please contact your administrator at {{company_link}}",
      "subject": "CheckOut Update"
    }`,
    notification_config: `{
      "body": "Welcome, {{old.inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{old.access_to}}. </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{old.expires_at}} <br/> <br/> If you have any questions please contact your administrator at {{company_link}}",
      "subject": "CheckOut Update"
    }`,
    created_at: new Date(),
    updated_at: new Date(),
    type: 'activity',
  }], {}),
  down: (queryInterface) => queryInterface.bulkDelete('template_contents', null, {}),
};
