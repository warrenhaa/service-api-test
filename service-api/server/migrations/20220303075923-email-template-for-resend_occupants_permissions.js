module.exports = {
  up: async (queryInterface) => {
    // occupant permissions resent
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantPermissionResent';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('98c4f75d-c135-446d-8c39-a18a9781979e', 'OccupantPermissionResent',true, false, false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantPermissionResent';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('5504e50a-989b-4c9a-9f78-bc34e15c8b28', 'OccupantPermissionResent', 'en-US', '{
          "body": "Hi  {{email}} ,<br/> you have provided the access permissions for gateway {{GatewayID}} successfully  ",
          "subject": "Occupant Permission Resent"
       }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
  },
  down: async (queryInterface, Sequelize) => { },
};
