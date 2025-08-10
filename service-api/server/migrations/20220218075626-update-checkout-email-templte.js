module.exports = {
  up: async (queryInterface) => {
    // checked out
    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantCheckedOut';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('64cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantCheckedOut',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantCheckedOut';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f120c817-edff-4aa2-97a1-d24e84da65fe', 'OccupantCheckedOut', 'en-US', '{
          "body": "Hi {{email}}, <br/> <br/> You have been checked-out from the location below <br/> <br/> Location: <br/> <b> {{access_to}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}} <br/> <br/>",
          "subject": "CheckOut Update"
        }',         '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-out"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-out",
          "title": "CheckOut Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
       `);
  },

  down: async (queryInterface, Sequelize) => { },
};
