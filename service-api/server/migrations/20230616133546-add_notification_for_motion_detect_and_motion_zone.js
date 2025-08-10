module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='Motion_zone';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('212e94db-90ff-4da5-86f1-b5e5f65089d9', 'Motion_zone',false, false,true, '{}',  '2023-06-16 14:01:23.35+05:30', '2023-06-16 14:01:23.35+05:30');
    delete from template_contents where key ='Motion_zone';
    INSERT INTO template_contents (id,key,language,email_config,sms_config,notification_config, created_at, updated_at, type)
VALUES ('ab38752c-b200-4ee0-b346-08f0cc8655fa', 'Motion_zone', 'en',null,null, '{
    "body": "Motion detected in smart zone",
    "title": "{{camera_name}}"
}', '2023-06-16 14:01:23.35+05:30', '2023-06-16 14:01:23.35+05:30', 'cameraalert'  )
    `);

    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='MotionDetect';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('bbf3aed6-1aa9-4b45-935c-bdef775b0b2e', 'MotionDetect',false, false,true, '{}',  '2023-06-16 14:01:23.35+05:30', '2023-06-16 14:01:23.35+05:30');
    delete from template_contents where key ='MotionDetect';
    INSERT INTO template_contents (id,key,language,email_config,sms_config,notification_config, created_at, updated_at, type)
VALUES ('bbf3aed6-1aa9-4b45-935c-bdef775b0b2e', 'MotionDetect', 'en',null,null, '{
    "body": "Motion detected",
    "title": "{{camera_name}}"
}', '2023-06-16 14:01:23.35+05:30', '2023-06-16 14:01:23.35+05:30', 'cameraalert'  )
    `);
  },
  async down(queryInterface, Sequelize) {
},
};