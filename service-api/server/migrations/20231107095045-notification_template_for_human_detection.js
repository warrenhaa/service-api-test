module.exports = {
  async up(queryInterface, Sequelize) { await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='HumanDetect';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('bfb4fc6b-c44d-4b9b-8a79-49b676b00849', 'HumanDetect',false, false,true, '{}',  '2023-06-16 14:01:23.35+05:30', '2023-06-16 14:01:23.35+05:30');
    delete from template_contents where key ='HumanDetect';
    INSERT INTO template_contents (id,key,language,email_config,sms_config,notification_config, created_at, updated_at, type)
VALUES ('3a90f9a5-568a-4556-9428-27a8d30acc11', 'HumanDetect', 'en',null,null, '{
    "body": "Human detected",
    "title": "{{camera_name}}"
}', '2023-06-16 14:01:23.35+05:30', '2023-06-16 14:01:23.35+05:30', 'cameraalert'  )
    `);
  },
  async down(queryInterface, Sequelize) {
},
};