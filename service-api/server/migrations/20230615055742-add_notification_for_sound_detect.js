module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='SoundDetect2';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('5d73780e-7f9c-4984-82ee-5ceb78a41fc1', 'SoundDetect2',false, false,true, '{}',  '2023-06-15 14:01:23.35+05:30', '2023-06-15 14:01:23.35+05:30');
    delete from template_contents where key ='SoundDetect2';
    INSERT INTO template_contents (id,key,language,email_config,sms_config,notification_config, created_at, updated_at, type)
VALUES ('8c960334-eda8-460e-bd54-433105bd4a15', 'SoundDetect2', 'en',null,null, '{
    "body": "Sound detected",
    "title": "{{camera_name}}"
}', '2023-06-15 14:01:23.35+05:30', '2023-06-15 14:01:23.35+05:30', 'cameraalert'  )
    `);
  },
  async down(queryInterface, Sequelize) {
},
};
