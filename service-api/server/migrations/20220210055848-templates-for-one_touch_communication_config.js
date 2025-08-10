module.exports = {
  up: async (queryInterface) => {
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
   }','2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'OneTouch');
    `);
  },

  down: async (queryInterface, Sequelize) => { },
};
