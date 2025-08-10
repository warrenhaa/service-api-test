module.exports = {
  up: async (queryInterface) => {
    //  Alert
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='lowBattery';
    delete from activity_log_communication_configs where event_name ='offline';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('1dbfc797-b3c2-4bab-8d4e-2049824cb679', 'Alert',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='lowBattery';
    delete from template_contents where key ='offline';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('4da39d4b-4c43-4927-a525-c4613715cb0e', 'Alert', 'en-US', '{
        "body": "{{message}}",
        "subject": "Device Alert"
        }', '{
          "body": "The Message is: {{message}}"
   }', '{
    "body": "The Message is: {{message}}",
    "subject": "Device Alert"
   }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'alert');
    `);
    // one touch
    await queryInterface.sequelize.query(`
    delete from template_contents where key = 'OneTouch';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('48d25fd3-223c-4a79-bf58-3498e8d610ca', 'OneTouch', 'en-US', '{
        "body": "{{message}}",
        "subject": "Automation rule {{name}} was triggered"
        }', '{
          "body": "Automation rule {{name}} was triggered, The Message is: {{message}}"
   }', '{
    "body": "Automation rule {{name}} was triggered, The Message is: {{message}}",
    "subject": "Automation rule {{name}} was triggered"
   }','2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'onetouch');
    `);
  },
  down: async (queryInterface, Sequelize) => { },
};
