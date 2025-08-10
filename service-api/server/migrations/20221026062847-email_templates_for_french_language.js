module.exports = {
  up: async (queryInterface) => {
    // user invite sent
    await queryInterface.sequelize.query(`
     INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f966bc26-e2e9-4195-b82e-c202ba4c215c', 'InviteSent', 'fr', '{
       "banner": "Welcome {{email}}",
        "body": "<p> {{inviter_email}} invited you to join {{company_name}}. Please click the button below to accept this invitation to register and access {{company_name}} portal </p> </mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> ACCEPT INVITATION </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\"> <p> Your invite expires on {{expires_at}} </p> <p>If you have any questions or trouble, please contact  <a href=\\"{{contact_url}}\\">{{company_name}}</a></p> Cheers,<br>The {{company_name}} Team (fr)",
        "subject": "Salus Smart Building Management Sign Up"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
    //  user invite resent
    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('d933dcce-4948-44e1-9900-47e6abbef1a2', 'InviteResent', 'fr', '{
        "banner": "Welcome {{email}}",
        "body": "<p> {{inviter_email}} invited you to join {{company_name}}. Please click the button below to accept this invitation to register and access {{company_name}} portal </p> </mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> ACCEPT INVITATION </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\"> <p> Your invite expires on {{expires_at}} </p> <p>If you have any questions or trouble, please contact  <a href=\\"{{contact_url}}\\">{{company_name}}</a></p> Cheers,<br>The {{company_name}} Team (fr)",
        "subject": "Salus Smart Building Management Sign Up"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
     INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('4abc4553-e3ff-4386-9e19-72e152df53fb', 'OccupantInviteAdded', 'fr', '{
        "banner": "Welcome",
        "body": "{{new.inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{{new.access_to}}} </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{new.expires_at}}. <br/> <br/> If you have any questions please contact your administrator at {{company_link}} (fr)<br/> <br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{new.button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
        "subject": "New Invitation"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('4b5068ec-d397-4f6e-bc0d-0b9c7f16859a', 'OccupantInviteResent', 'fr', '{
        "banner": "Welcome",
        "body": "{{new.inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{{new.access_to}}} </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{new.expires_at}}. <br/> <br/> If you have any questions please contact your administrator at {{company_link}} (fr)<br/> <br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{new.button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
        "subject":"Invitation Resent"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
   INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('9c7c8d91-936b-4b16-a274-543fd94b353b', 'OccupantInviteOfCheckInUpdated', 'fr', '{
        "banner": "Welcome",
        "body": "{{inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{{access_to}}} </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{{expires_at}}}. <br/> <br/> If you have any questions please contact your administrator at {{company_link}} (fr)<br/> <br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
        "subject": "OccupantInviteCheckIn Update"
    }', '{
          "body": "Welcome, {{inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> This invite is valid till {{{expires_at}}}"
        }', '{
          "body": "Welcome, {{inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> This invite is valid till {{{expires_at}}} ",
          "title": "OccupantInviteCheckIn Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(` 
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('76d6f4b8-77f3-4f28-939b-1052144768f6', 'OccupantInviteDeleted', 'fr', '{
        "banner": "Welcome",
        "body": "{{old.inviter_email}} has cancelled your invitation to new smart home as occupant. <br/> <br/> You have no access to: <br/> <b> {{{old.access_to}}} </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link} (fr)}",
        "subject": "Invitation Cancelled"
    }', '{
          "body": "Hi {{email}}, <br/> <br/> your invitation has cancelled"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> your invitation has cancelled",
          "title": "Invitation Cancelled"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
   
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('37294bc9-19b2-4ac9-90cf-b2b04ce0a95e', 'OccupantRegistered', 'fr', '{
        "banner": "Welcome {{new.email}}",
        "body": "You have registered successfully to {{company_name}}, If you have any questions please contact your administrator at {{company_link}} (fr)<br/>",
        "subject": "Welcome to {{company_name}}"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
    // occupant joined
    await queryInterface.sequelize.query(`
    
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('11698aa7-c677-458c-83af-e75a72c70db9', 'OccupantJoined', 'fr', '{
        "banner": "Hi {{inviter_email}}",
        "body": "Occupant {{new.email}} you have invited joined successfully  to {{company_name}}.(fr)",
        "subject": "Invited Occupant joined  {{company_name}}"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('b08a3823-5bda-4102-a3a8-ab6e07e50f36', 'OccupantCheckedIn', 'fr', '{
          "banner": "Hi {{userName}}",
          "body": "You have been checked-in to the location below on {{Check_in_date}} at {{Check_in_time}}.<br/> <br/> Location: <br/> <b> {{{access_to}}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}} (fr).<br/><br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
          "subject": "CheckIn Update"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-in (fr)"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-in (fr)",
          "title": "CheckIn Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('3d794354-ce70-44d3-b9df-bba219cf3b46', 'OccupantCheckedOut', 'fr', '{
        "banner": "Hi {{userName}}",  
        "body": "You have been checked-out from the location below on {{Check_out_date}} at {{Check_out_time}}.<br/> <br/> Location: <br/> <b> {{{access_to}}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}} (fr).<br/><br/></mj-text> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
          "subject": "CheckOut Update"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-out (fr)"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-out (fr)",
          "title": "CheckOut Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('3891a2bf-d16a-4568-bb54-a286474d6e91', 'OccupantPermissionAdded', 'fr', '{
        "banner": "Hi {{userName}}", 
        "body": "You now have access to {{gatewayName}}. <br> Get connected by creating an account or log in with your existing account to access your devices. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}. (fr)",
        "subject": "You have been granted the Access "
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('b8e63119-a84e-4a80-aef5-d4dce0a7fb3a', 'OccupantPermissionUpdated', 'fr', '{
        "banner": "Hi {{userName}}", 
        "body": "You now have access to {{gatewayName}}.<br>  Get connected by creating an account or log in with your existing account to access your devices. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}. (fr)",
        "subject": "You have been granted the Access"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('8f35dcdf-4e4f-4cac-8a3c-ab34b5ee6d89', 'OccupantPermissionDeleted', 'fr', '{
        "banner": "Hi {{userName}}",   
        "body": "The access permissions for gateway {{gatewayName}} has been removed by {{sharer_email}} on {{removed_date}} at {{removed_time}}. (fr)",
        "subject": "Access Permissions Removed"
       }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`

    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('d143a505-f64e-4189-9537-b7a7a54cb147', 'OccupantPermissionResent', 'fr', '{
          "banner": "Hi {{userName}}",   
          "body": "You now have access to {{gatewayName}}.<br>  Get connected by creating an account or log in with your existing account to access your devices. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}. (fr)",
        "subject": "Access Permissions Resent"
       }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('a736ef91-a011-4f2f-b787-297683ef2edb', 'Alert', 'fr', '{
        "banner": "Hello {{gatewayName}}",
        "body": "{{message}} (fr)",
        "subject": "{{message}}"
        }', '{
          "body": "The Message is: {{message}}(fr)"
   }', '{
    "body": "The Message is: {{message}}(fr)",
    "subject": "{{message}}"
   }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'alert');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('7954a17b-6e16-4049-874f-829449e3cc31', 'OwnerUnregisteredGateway', 'fr', '{
         "banner": "Hi {{first_name}} {{last_name}}",   
        "body": "You have unregistered the gateway \\"{{gateway_name}}\\" ( {{gateway_code}} ). You no longer have access to the gateway and access shared with other users has also been revoked.<br/>In case you have not unregistered the gateway, then you can contact support team. (fr)",
        "subject": "Gateway Unregistered"
       }', null, null, '2022-04-12 08:33:28.35+00', '2022-04-12 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('09c82820-259a-496d-845f-d3056a7673f1', 'GatewayUnregistered', 'fr', '{
       "banner": "Hi {{first_name}} {{last_name}}",   
        "body": "Owner unregistered the gateway \\"{{gateway_name}}\\" ( {{gateway_code}} ). You no longer have access to the gateway. (fr)",
        "subject": "Gateway Unregistered"
       }', null, null, '2022-04-12 08:33:28.35+00', '2022-04-12 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('415f7513-8329-4775-95c5-22b96514b3da', 'OccupantDeleted', 'fr', '{
        "banner": "Hi {{userName}}",
        "body": "<p> Goodbyes are never easy. But your request to delete the profile has been completed. </p> </br> </br>  <p> Please dont forget that you can always create a new profile. (fr)</p> <br/> <br/> </br>",
        "subject": "Your profile delete is initiated"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(` 
    INSERT INTO public.template_contents(
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('cb4036a8-4fa8-4614-8cac-f1ef0fbf9df7', 'JobError', 'fr', '{
       "banner": "Hi {{receiver_email}}",
       "body": "{{message}} (fr)",
       "subject": "Job Failed"
   }', null, null, '2022-02-23 08:33:28.35+00', '2022-02-23 08:33:28.35+00', 'activity');
   `);
    // one touch
    await queryInterface.sequelize.query(`
   INSERT INTO public.template_contents(   
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('31829049-01c9-441c-95f6-ad93b8847863', 'OneTouch', 'fr', '{
        "banner": "Hi {{receiver_email}}",
        "body": "{{message}}(fr)",
        "subject": "Automation rule {{name}} was triggered"
        }', '{
          "body": "Automation rule {{name}} was triggered, The Message is: {{message}} (fr)"
   }', '{
    "body": "Automation rule {{name}} was triggered, The Message is: {{message}} (fr)",
    "subject": "Automation rule {{name}} was triggered"
   }','2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'onetouch');
    `);
  },
  down: async (queryInterface, Sequelize) => { },
};
