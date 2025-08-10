module.exports = {
  up: async (queryInterface) => {
    // occupant permissions resent
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantPermissionDeleted';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('c7b058b0-332e-42eb-a31c-7af0aeb3d144', 'OccupantPermissionDeleted',true, false, false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantPermissionDeleted';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('8887aa3b-4d33-42ff-8357-76d9e5b265c3', 'OccupantPermissionDeleted', 'en-US', '{
          "body": "Hi {{email}} ,<br/> the access permissions for gateway {{GatewayID}} has been removed.",
        "subject": "Access Permissions Removed"
       }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
  },
  down: async (queryInterface, Sequelize) => { },
};
