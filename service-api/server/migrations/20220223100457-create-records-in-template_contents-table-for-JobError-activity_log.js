module.exports = {
  up: async (queryInterface, Sequelize) => {
    // job error
    await queryInterface.sequelize.query(` delete from activity_log_communication_configs where event_name ='JobError';
   INSERT INTO public.activity_log_communication_configs(
     id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
     VALUES ('700934ac-c4eb-4d75-909a-5c27cd12f5af', 'JobError',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
   delete from template_contents where key ='JobError';
   INSERT INTO public.template_contents(
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('eb5cb491-7256-4866-8106-e8399e2460fb', 'JobError', 'en-US', '{
       "body": "{{message}}",
       "subject": "Job Failed"
   }', null, null, '2022-02-23 08:33:28.35+00', '2022-02-23 08:33:28.35+00', 'activity');
   `);
  },

  down: async (queryInterface, Sequelize) => {

  },
};
