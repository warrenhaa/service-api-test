module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='Livestream';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('639bd354-fee1-4da8-9c8c-e5284b67631f', 'Livestream',false, false,true, '{}',  '2023-06-16 14:01:23.35+05:30', '2023-06-16 14:01:23.35+05:30');
    delete from template_contents where key ='Livestream';
    INSERT INTO template_contents (id,key,language,email_config,sms_config,notification_config, created_at, updated_at, type)
VALUES ('639bd354-fee1-4da8-9c8c-e5284b67631f', 'Livestream', 'en',null,null, '{
    "body": "Livestreaming started",
    "title": "{{camera_name}}"
}', '2024-02-22 14:01:23.35+05:30', '2024-02-22 14:01:23.35+05:30', 'cameraalert'  )
    `);
  },
};
