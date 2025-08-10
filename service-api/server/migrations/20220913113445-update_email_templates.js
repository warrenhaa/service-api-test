module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantCheckedIn';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('62cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantCheckedIn',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantCheckedIn';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f020c817-edff-4aa2-97a1-d24e84da65fe', 'OccupantCheckedIn', 'en-US', '{
          "banner": "Hi {{userName}}",
          "body": "You have been checked-in to the location below on {{Check_in_date}} at {{Check_in_time}}.<br/> <br/> Location: <br/> <b> {{{access_to}}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}}.<br/><br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
          "subject": "CheckIn Update"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-in"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-in",
          "title": "CheckIn Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantCheckedOut';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('64cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantCheckedOut',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantCheckedOut';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f120c817-edff-4aa2-97a1-d24e84da65fe', 'OccupantCheckedOut', 'en-US', '{
        "banner": "Hi {{userName}}",  
        "body": "You have been checked-out from the location below on {{Check_out_date}} at {{Check_out_time}}.<br/> <br/> Location: <br/> <b> {{{access_to}}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}}.<br/><br/></mj-text> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
          "subject": "CheckOut Update"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-out"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-out",
          "title": "CheckOut Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantPermissionAdded';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('71cd55e0-8311-4f8c-850f-995985c694bb', 'OccupantPermissionAdded',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantPermissionAdded';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('e0741817-edff-4aa2-97a1-d24e84da65fd', 'OccupantPermissionAdded', 'en-US', '{
        "banner": "Hi {{userName}}", 
        "body": "You now have access to {{gatewayName}}. <br> Get connected by creating an account or log in with your existing account to access your devices. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}.",
        "subject": "You have been granted the Access"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    
    `);

    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantPermissionUpdated';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('74cd55e0-8311-4f8c-850f-995985c694bb', 'OccupantPermissionUpdated',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantPermissionUpdated';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('a002d7ec-edff-4aa2-97a1-d24e84da65fd', 'OccupantPermissionUpdated', 'en-US', '{
        "banner": "Hi {{userName}}", 
        "body": "You now have access to {{gatewayName}}.<br>  Get connected by creating an account or log in with your existing account to access your devices. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}.",
        "subject": "You have been granted the Access"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    
    `);

    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantPermissionDeleted';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('c7b058b0-332e-42eb-a31c-7af0aeb3d144', 'OccupantPermissionDeleted',true, false, false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantPermissionDeleted';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('8887aa3b-4d33-42ff-8357-76d9e5b265c3', 'OccupantPermissionDeleted', 'en-US', '{
        "banner": "Hi {{userName}}",   
        "body": "The access permissions for gateway {{gatewayName}} has been removed by {{sharer_email}} on {{removed_date}} at {{removed_time}}. ",
        "subject": "Access Permissions Removed"
       }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantPermissionResent';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('98c4f75d-c135-446d-8c39-a18a9781979e', 'OccupantPermissionResent',true, false, false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantPermissionResent';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('5504e50a-989b-4c9a-9f78-bc34e15c8b28', 'OccupantPermissionResent', 'en-US', '{
          "banner": "Hi {{userName}}",   
          "body": "You now have access to {{gatewayName}}.<br>  Get connected by creating an account or log in with your existing account to access your devices. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}.",
        "subject": "Access Permissions Resent"
       }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantDeleted';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('87a54994-4b42-44c9-b03a-e19a867d004b', 'OccupantDeleted',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantDeleted';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('ee9f8561-deed-46e0-9eea-bcbf92997e06', 'OccupantDeleted', 'en-US', '{
        "banner": "Hi {{userName}}",
        "body": "<p> Goodbyes are never easy. But your request to delete the profile has been completed. </p> </br> </br>  <p> Please dont forget that you can always create a new profile. </p> <br/> <br/> </br>",
        "subject": "Your profile delete is initiated"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
  },
  down: async (queryInterface, Sequelize) => { },
};
