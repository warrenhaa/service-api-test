module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='MotionDetect';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('bbf3aed6-1aa9-4b45-935c-bdef775b0b2e', 'MotionDetect',false, false,true, '{}',  '2023-01-03 14:01:23.35+05:30', '2023-01-03 14:01:23.35+05:30');
    delete from template_contents where key ='MotionDetect';
    INSERT INTO template_contents (id,key,language,email_config,sms_config,notification_config, created_at, updated_at, type)
VALUES ('bbf3aed6-1aa9-4b45-935c-bdef775b0b2e', 'MotionDetect', 'en',null,null, '{
    "body": "Motion is detected.",
    "title": "{{camera_name}}"
}', '2023-01-03 14:01:23.35+05:30', '2023-01-03 14:01:23.35+05:30', 'cameraalert'  )
    `);
  },
  async down(queryInterface, Sequelize) {
},
};
