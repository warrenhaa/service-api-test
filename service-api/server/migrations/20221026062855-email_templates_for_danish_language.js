module.exports = {
  up: async (queryInterface) => {
    // user invite sent
    await queryInterface.sequelize.query(`
     INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('02999c00-1415-4008-b5f1-bbca25ef1c8a', 'InviteSent', 'da', '{
       "banner": "Welcome {{email}}",
        "body": "<p> {{inviter_email}} invited you to join {{company_name}}. Please click the button below to accept this invitation to register and access {{company_name}} portal </p> </mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> ACCEPT INVITATION </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\"> <p> Your invite expires on {{expires_at}} </p> <p>If you have any questions or trouble, please contact  <a href=\\"{{contact_url}}\\">{{company_name}}</a></p> Cheers,<br>The {{company_name}} Team (da)",
        "subject": "Salus Smart Building Management Sign Up"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
    //  user invite resent
    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('02cd3e30-510f-4171-a48c-b7524bda5952', 'InviteResent', 'da', '{
        "banner": "Welcome {{email}}",
        "body": "<p> {{inviter_email}} invited you to join {{company_name}}. Please click the button below to accept this invitation to register and access {{company_name}} portal </p> </mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> ACCEPT INVITATION </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\"> <p> Your invite expires on {{expires_at}} </p> <p>If you have any questions or trouble, please contact  <a href=\\"{{contact_url}}\\">{{company_name}}</a></p> Cheers,<br>The {{company_name}} Team (da)",
        "subject": "Salus Smart Building Management Sign Up"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
     INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('28f1599f-97f4-432a-a6f8-836c3ac8c4a7', 'OccupantInviteAdded', 'da', '{
        "banner": "Welcome",
        "body": "{{new.inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{{new.access_to}}} </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{new.expires_at}}. <br/> <br/> If you have any questions please contact your administrator at {{company_link}} (da)<br/> <br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{new.button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
        "subject": "New Invitation"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('c53cf5e5-8871-4566-94eb-80617dd48927', 'OccupantInviteResent', 'da', '{
        "banner": "Welcome",
        "body": "{{new.inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{{new.access_to}}} </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{new.expires_at}}. <br/> <br/> If you have any questions please contact your administrator at {{company_link}} (da)<br/> <br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{new.button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
        "subject":"Invitation Resent"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
   INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('9f3c3609-7a48-48d2-b045-81ac931c6888', 'OccupantInviteOfCheckInUpdated', 'da', '{
        "banner": "Welcome",
        "body": "{{inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{{access_to}}} </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{{expires_at}}}. <br/> <br/> If you have any questions please contact your administrator at {{company_link}} (da)<br/> <br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
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
      VALUES ('f73bd741-768e-4795-83d0-535834b9c04b', 'OccupantInviteDeleted', 'da', '{
        "banner": "Welcome",
        "body": "{{old.inviter_email}} has cancelled your invitation to new smart home as occupant. <br/> <br/> You have no access to: <br/> <b> {{{old.access_to}}} </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link} (da)}",
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
      VALUES ('f7060692-edf5-4741-9b57-d61fff96bdcd', 'OccupantRegistered', 'da', '{
        "banner": "Welcome {{new.email}}",
        "body": "You have registered successfully to {{company_name}}, If you have any questions please contact your administrator at {{company_link}} (da)<br/>",
        "subject": "Welcome to {{company_name}}"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
    // occupant joined
    await queryInterface.sequelize.query(`
    
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('cfb03744-055b-4abf-86c6-24bfb0b27183', 'OccupantJoined', 'da', '{
        "banner": "Hi {{inviter_email}}",
        "body": "Occupant {{new.email}} you have invited joined successfully  to {{company_name}}.(da)",
        "subject": "Invited Occupant joined  {{company_name}}"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('6bb5a44b-aa0c-4302-8f4d-e2706d2ac78b', 'OccupantCheckedIn', 'da', '{
          "banner": "Hi {{userName}}",
          "body": "You have been checked-in to the location below on {{Check_in_date}} at {{Check_in_time}}.<br/> <br/> Location: <br/> <b> {{{access_to}}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}} (da).<br/><br/></mj-text> <mj-button background-color = \\"#1E88E5\\" href=\\"{{button_link}}\\" padding-top=\\"00\\"> Get Connected </mj-button> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
          "subject": "CheckIn Update"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-in (da)"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-in (da)",
          "title": "CheckIn Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('d7801d8d-a021-4bb1-9791-c4fac6468a3c', 'OccupantCheckedOut', 'da', '{
        "banner": "Hi {{userName}}",  
        "body": "You have been checked-out daom the location below on {{Check_out_date}} at {{Check_out_time}}.<br/> <br/> Location: <br/> <b> {{{access_to}}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}} (da).<br/><br/></mj-text> <mj-text font-size=\\"16px\\" color= \\"#000000\\" font-family=\\"Helvetica\\" font-weight=\\"normal\\" padding=\\"25px 60px 25px 60px\\" line-height=\\"20px\\">",
          "subject": "CheckOut Update"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-out (da)"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-out (da)",
          "title": "CheckOut Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('6efc7d38-fbbe-4d71-b0d0-f2cccc23013a', 'OccupantPermissionAdded', 'da', '{
        "banner": "Hi {{userName}}", 
        "body": "You now have access to {{gatewayName}}. <br> Get connected by creating an account or log in with your existing account to access your devices. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}. (da)",
        "subject": "You have been granted the Access "
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('b473366a-cfae-45ef-80b0-a4b378ca035b', 'OccupantPermissionUpdated', 'da', '{
        "banner": "Hi {{userName}}", 
        "body": "You now have access to {{gatewayName}}.<br>  Get connected by creating an account or log in with your existing account to access your devices. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}. (da)",
        "subject": "You have been granted the Access"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('7213968c-789d-43bd-b5eb-ef2eaebe9a91', 'OccupantPermissionDeleted', 'da', '{
        "banner": "Hi {{userName}}",   
        "body": "The access permissions for gateway {{gatewayName}} has been removed by {{sharer_email}} on {{removed_date}} at {{removed_time}}. (da)",
        "subject": "Access Permissions Removed"
       }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`

    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('aea137d0-6573-4b20-aff7-571dcf3deeb4', 'OccupantPermissionResent', 'da', '{
          "banner": "Hi {{userName}}",   
          "body": "You now have access to {{gatewayName}}.<br>  Get connected by creating an account or log in with your existing account to access your devices. <br/> <br/> If you have any questions please contact your administrator at {{company_link}}. (da)",
        "subject": "Access Permissions Resent"
       }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('5bc326c3-582c-473e-a097-a9f3fb5287e0', 'Alert', 'da', '{
        "banner": "Hello {{gatewayName}}",
        "body": "{{message}} (da)",
        "subject": "{{message}}"
        }', '{
          "body": "The Message is: {{message}}(da)"
   }', '{
    "body": "The Message is: {{message}}(da)",
    "subject": "{{message}}"
   }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'alert');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f6998b55-a69a-423b-bf13-03857768faa6', 'OwnerUnregisteredGateway', 'da', '{
         "banner": "Hi {{first_name}} {{last_name}}",   
        "body": "You have unregistered the gateway \\"{{gateway_name}}\\" ( {{gateway_code}} ). You no longer have access to the gateway and access shared with other users has also been revoked.<br/>In case you have not unregistered the gateway, then you can contact support team. (da)",
        "subject": "Gateway Unregistered"
       }', null, null, '2022-04-12 08:33:28.35+00', '2022-04-12 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('e9d6478a-c8c9-4461-8aa2-56f9af3b4e15', 'GatewayUnregistered', 'da', '{
       "banner": "Hi {{first_name}} {{last_name}}",   
        "body": "Owner unregistered the gateway \\"{{gateway_name}}\\" ( {{gateway_code}} ). You no longer have access to the gateway. (da)",
        "subject": "Gateway Unregistered"
       }', null, null, '2022-04-12 08:33:28.35+00', '2022-04-12 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(`
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f9b73f12-dbe8-444a-8431-65e742028ce2', 'OccupantDeleted', 'da', '{
        "banner": "Hi {{userName}}",
        "body": "<p> Goodbyes are never easy. But your request to delete the profile has been completed. </p> </br> </br>  <p> Please dont forget that you can always create a new profile. (da)</p> <br/> <br/> </br>",
        "subject": "Your profile delete is initiated"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);

    await queryInterface.sequelize.query(` 
    INSERT INTO public.template_contents(
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('574dc987-f285-4296-8e9a-428d6ed7be2d', 'JobError', 'da', '{
       "banner": "Hi {{receiver_email}}",
       "body": "{{message}} (da)",
       "subject": "Job Failed"
   }', null, null, '2022-02-23 08:33:28.35+00', '2022-02-23 08:33:28.35+00', 'activity');
   `);
    // one touch
    await queryInterface.sequelize.query(`
   INSERT INTO public.template_contents(   
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('de3bcaa8-21c6-4c09-ab08-0c6e85769fd7', 'OneTouch', 'da', '{
        "banner": "Hi {{receiver_email}}",
        "body": "{{message}}(da)",
        "subject": "Automation rule {{name}} was triggered"
        }', '{
          "body": "Automation rule {{name}} was triggered, The Message is: {{message}} (da)"
   }', '{
    "body": "Automation rule {{name}} was triggered, The Message is: {{message}} (da)",
    "subject": "Automation rule {{name}} was triggered"
   }','2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'onetouch');
    `);
  },
  down: async (queryInterface, Sequelize) => { },
};
