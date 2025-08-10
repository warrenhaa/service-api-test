module.exports = {
  up: async (queryInterface) => {
    // user invite sent
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='InviteSent';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('f52798d8-15a1-421a-b860-26060f95a65f', 'InviteSent',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='InviteSent';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('403f456b-f509-42de-ad15-5b2b2867cd4e', 'InviteSent', 'en-US', '{
        "banner": "Welcome {{email}}",
        "body": "<p> {{inviter_email}} invited you to join {{company_name}}. Please click the button below to accept this invitation to register and access {{company_name}} portal </p> </mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> ACCEPT INVITATION </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\"> <p> Your invite expires on {{expires_at}} </p> <p>If you have any questions or trouble, please contact  <a href=\\"{{contact_url}}\\">{{company_name}}</a></p> Cheers,<br>The {{company_name}} Team",
        "subject": "Salus Smart Building Management Sign Up"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
    //  user invite resent
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='InviteResent';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('623ce2c7-27a6-4bfe-8652-59f5e7589fd8', 'InviteResent',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='InviteResent';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('226059db-29d9-4e9e-81fb-0a0b4a564b2f', 'InviteResent', 'en-US', '{
        "banner": "Welcome {{email}}",
        "body": "<p> {{inviter_email}} invited you to join {{company_name}}. Please click the button below to accept this invitation to register and access {{company_name}} portal </p> </mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> ACCEPT INVITATION </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\"> <p> Your invite expires on {{expires_at}} </p> <p>If you have any questions or trouble, please contact  <a href=\\"{{contact_url}}\\">{{company_name}}</a></p> Cheers,<br>The {{company_name}} Team",
        "subject": "Salus Smart Building Management Sign Up"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantInviteAdded';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('73cd55e0-8311-4f8c-850f-995985c694bb', 'OccupantInviteAdded',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantInviteAdded';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('e0e9d7ec-edff-4aa2-97a1-d24e84da65fd', 'OccupantInviteAdded', 'en-US', '{
        "banner": "Welcome",
        "body": "{{new.inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{{new.access_to}}} </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{new.expires_at}}. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}.<br/> <br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{new.button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
        "subject": "New Invitation"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantInviteResent';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('72cd55e0-8311-4f8c-850f-995985c694bb', 'OccupantInviteResent',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantInviteResent';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('e0341817-edff-4aa2-97a1-d24e84da65fd', 'OccupantInviteResent', 'en-US', '{
        "banner": "Welcome",
        "body": "{{new.inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{{new.access_to}}} </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{new.expires_at}}. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}.<br/> <br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{new.button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
        "subject":"Invitation Resent"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantInviteOfCheckInUpdated';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('65cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantInviteOfCheckInUpdated',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantInviteOfCheckInUpdated';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f130c817-edff-4aa2-97a1-d24e84da65fe', 'OccupantInviteOfCheckInUpdated', 'en-US', '{
        "banner": "Welcome",
        "body": "{{inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{{access_to}}} </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{new.expires_at}}. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}.<br/> <br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
        "subject": "OccupantInviteCheckIn Update"
    }', '{
          "body": "Welcome, {{inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> This invite is valid till {{expires_at}}"
        }', '{
          "body": "Welcome, {{inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> This invite is valid till {{expires_at}} ",
          "title": "OccupantInviteCheckIn Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(` delete from activity_log_communication_configs where event_name ='OccupantInviteDeleted';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('63cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantInviteDeleted',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantInviteDeleted';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f023c817-edff-4aa2-97a1-d24e84da65fe', 'OccupantInviteDeleted', 'en-US', '{
        "banner": "Welcome",
        "body": "{{old.inviter_email}} has cancelled your invitation to new smart home as occupant. <br/> <br/> You have no access to: <br/> <b> {{{old.access_to}}} </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}}.",
        "subject": "Invitation Cancelled"
    }', '{
          "body": "Hi {{email}}, <br/> <br/> your invitation has cancelled"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> your invitation has cancelled",
          "title": "Invitation Cancelled"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantRegistered';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('66cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantRegistered',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantRegistered';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('607cdc2b-7da8-4fd4-b813-3a3d783ee2b3', 'OccupantRegistered', 'en-US', '{
        "banner": "Welcome {{new.email}}",
        "body": "You have registered successfully to {{company_name}}, If you have any questions please contact your administrator at {{company_link}}.<br/>",
        "subject": "Welcome to {{company_name}}"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
    // occupant joined
    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantJoined';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('67cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantJoined',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantJoined';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('547cdb2b-7da8-4fd4-b813-3a3d783ee2b3', 'OccupantJoined', 'en-US', '{
        "banner": "Hi {{inviter_email}}",
        "body": "Occupant {{new.email}} you have invited joined successfully  to {{company_name}}.",
        "subject": "Invited Occupant joined  {{company_name}}"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantCheckedIn';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('62cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantCheckedIn',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantCheckedIn';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f020c817-edff-4aa2-97a1-d24e84da65fe', 'OccupantCheckedIn', 'en-US', '{
          "banner": "Hi {{email}}",
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
        "banner": "Hi {{email}}",  
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
        "banner": "Hi {{email}}", 
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
        "banner": "Hi {{email}}", 
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
        "banner": "Hi {{email}}",   
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
          "banner": "Hi {{email}}",   
          "body": "You now have access to {{gatewayName}}.<br>  Get connected by creating an account or log in with your existing account to access your devices. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}.",
        "subject": "Access Permissions Resent"
       }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='Alert';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('1dbfc797-b3c2-4bab-8d4e-2049824cb679', 'Alert',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='Alert';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('4da39d4b-4c43-4927-a525-c4613715cb0e', 'Alert', 'en-US', '{
        "banner": "Hello {{gatewayName}}",
        "body": "{{message}}",
        "subject": "{{message}}"
        }', '{
          "body": "The Message is: {{message}}"
   }', '{
    "body": "The Message is: {{message}}",
    "subject": "{{message}}"
   }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'alert');
    `);
  },
  down: async (queryInterface, Sequelize) => { },
};
