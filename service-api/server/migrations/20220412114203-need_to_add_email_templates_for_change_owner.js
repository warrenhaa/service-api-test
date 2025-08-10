module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OwnerUnregisteredGateway';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('b8b058b0-332e-42eb-a31c-7af0aeb3d144', 'OwnerUnregisteredGateway',true, false, false, '{}',  '2022-04-12 08:33:28.35+00',  '2022-04-12 08:33:28.35+00');
    delete from template_contents where key ='OwnerUnregisteredGateway';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('8667aa3b-4d33-42ff-8357-76d9e5b265c3', 'OwnerUnregisteredGateway', 'en-US', '{
        "banner": "Hi {{email}}",   
        "body": "You have unregistered the {{gateway_name}}({{gateway_code}}).So you no longer have access to the gateway and access shared to other usersas also been revoked.<br/>In case you have not unregistered the gateway,then you can contact support team.",
        "subject": "Gateway Unregistered"
       }', null, null, '2022-04-12 08:33:28.35+00', '2022-04-12 08:33:28.35+00', 'activity');
    `);
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='GatewayUnregistered';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('d8b058b0-332e-42eb-a31c-7af0aeb3d144', 'GatewayUnregistered',true, false, false, '{}',  '2022-04-12 08:33:28.35+00',  '2022-04-12 08:33:28.35+00');
    delete from template_contents where key ='GatewayUnregistered';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('8677aa3b-4d33-42ff-8357-76d9e5b265c3', 'GatewayUnregistered', 'en-US', '{
        "banner": "Hi {{email}}",   
        "body": "Owner unregistered the {{gateway_name}}({{gateway_code}}).So you no longer have access to the gateway.",
        "subject": "Gateway Unregistered"
       }', null, null, '2022-04-12 08:33:28.35+00', '2022-04-12 08:33:28.35+00', 'activity');
    `);
  },

  down: async () => {
  },
};
