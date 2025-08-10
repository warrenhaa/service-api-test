module.exports = {
  up: async (queryInterface) => {
    // delete occupant
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantDeleted';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('87a54994-4b42-44c9-b03a-e19a867d004b', 'OccupantDeleted',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantDeleted';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('ee9f8561-deed-46e0-9eea-bcbf92997e06', 'OccupantDeleted', 'en-US', '{
        "banner": "Hi {{email}}",
        "body": "<p> Goodbyes are never easy. But your request to delete the profile has been completed. </p> </br> </br>  <p> Please dont forget that you can always create a new profile. </p> <br/> <br/> </br>",
        "subject": "Your profile delete is initiated"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
  },
  down: async (queryInterface, Sequelize) => { },
};
