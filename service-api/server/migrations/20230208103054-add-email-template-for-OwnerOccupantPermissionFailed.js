'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OwnerOccupantPermissionFailed';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('57483eaf-3537-4596-bccf-350009ae8b79', 'OwnerOccupantPermissionFailed',true, false,false, '{}',  '2023-02-08 08:33:28.35+00',  '2023-02-08 08:33:28.35+00');
    delete from template_contents where key ='OwnerOccupantPermissionFailed';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('b8462b48-48e4-43f5-b256-3ed2c8bb0e46', 'OwnerOccupantPermissionFailed', 'en', '{
        "body": "<p>We noticed the gateway \\"{{gateway_name}}( {{gateway_code}} )\\" share was not successful to \\"{{sharer_name}}\\". Please try to share again.</p>",
        "banner": "Hi {{first_last_name}}", 
        "subject": "Gateway Share Unsuccessful"
      }', '{
        "body": "<p>We noticed the gateway \\"{{gateway_name}}( {{gateway_code}} )\\" share was not successful to \\"{{sharer_name}}\\". Please try to share again.</p>"
        }', '{
        "body": "<p>We noticed the gateway \\"{{gateway_name}}( {{gateway_code}} )\\" share was not successful to \\"{{sharer_name}}\\". Please try to share again.</p>",
        "subject": "Gateway Share Unsuccessful"
      }', '2023-02-08 08:33:28.35+00', '2023-02-08 08:33:28.35+00', 'activity');    
    `);

  },
  async down(queryInterface, Sequelize) {
  }
};
