module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.sequelize.query(`
    delete from template_contents where key ='geofenceHomeAlert';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('e3341092-af7c-4306-b1a4-f7ace1945773', 'geofenceHomeAlert', 'en', '{
        "body": "{{message}}",
        "banner": "Hi {{first_last_name}}", 
        "subject": "Welcome home"
      }', '{}', '{
        "body": "{{message}}",
        "title": "Welcome home"
      }', '2023-05-05 08:33:28.35+00', '2023-05-05 08:33:28.35+00', 'geofence'); 
      
      delete from template_contents where key ='geofenceAwayAlert';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('fde73b62-3888-4cb9-9690-55e6d04c6b98', 'geofenceAwayAlert', 'en', '{
        "body": "{{message}}",
        "banner": "Hi {{first_last_name}}", 
        "subject": "Nobody at home anyone"
      }', '{}', '{
        "body": "{{message}}",
        "title": "Nobody at home anyone"
      }', '2023-05-05 08:33:28.35+00', '2023-05-05 08:33:28.35+00', 'geofence'); 
    `)

  },
  async down(queryInterface, Sequelize) {
  }
};
