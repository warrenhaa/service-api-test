module.exports = {
  up: async (queryInterface) => {
    // occupant permissions resent
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantPermissionAdded';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('71cd55e0-8311-4f8c-850f-995985c694bb', 'OccupantPermissionAdded',true, false, false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantPermissionAdded';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('e0741817-edff-4aa2-97a1-d24e84da65fd', 'OccupantPermissionAdded', 'en-US', '{
          "body": "Hi {{email}} ,<br/> you have provided the access permissions for gateway {{GatewayID}} successfully  ",
        "subject": "Access Permissions Provided"
       }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantPermissionUpdated';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('74cd55e0-8311-4f8c-850f-995985c694bb', 'OccupantPermissionUpdated',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantPermissionUpdated';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('a002d7ec-edff-4aa2-97a1-d24e84da65fd', 'OccupantPermissionUpdated', 'en-US', '{
        "body": "Hi  {{email}} ,<br/> you have provided the access permissions for gateway {{GatewayID}} successfully  ",
        "subject": "Access Permissions Provided"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');`);
  },
  down: async (queryInterface, Sequelize) => { },
};
