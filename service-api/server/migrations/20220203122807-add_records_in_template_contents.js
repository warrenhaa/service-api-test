module.exports = {
  up: async (queryInterface, Sequelize) => {
    // update template_contents table
    await queryInterface.changeColumn('template_contents', 'key', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
    // offline
    await queryInterface.sequelize.query(`delete from alert_types where alert_type ='offline';
    INSERT INTO alert_types (id, alert_type, severity, email,sms,notification,placeholders,default_message,created_at,updated_at)
    VALUES ('b730c417-edff-4aa2-27a1-d24e34da65fe', 'offline', 'Low', '{
        "delay": 600,
        "isEnable": true
    }','{
        "delay": 600,
        "isEnable": true
    }','{
        "delay": 60,
        "isEnable": true
    }','{}','Device is offline','2022-02-01 04:33:40.072+00','2022-02-01 04:33:40.072+00')
    ON CONFLICT (alert_type) DO NOTHING;
    delete from template_contents where key ='offline';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('a720c417-edff-4aa2-27a1-d24e34da65fe', 'offline', 'en-US', '{
        "body": "{{alert_message}}",
        "subject": "Device Offline Alert"
    }', '{
        "body": "Device is offline"
    }', '{
        "body": "Device is offline",
        "title": "New alert message"
    }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'alert');
    `);
    // low battery
    await queryInterface.sequelize.query(`delete from alert_types where alert_type ='lowBattery';
    INSERT INTO alert_types (id, alert_type, severity, email,sms,notification,placeholders,default_message,created_at,updated_at)
    VALUES ('f420c817-edff-4aa2-97a1-d24e84da65fe', 'lowBattery', 'Low', '{
        "delay": 600,
        "isEnable": true
    }','{
        "delay": 600,
        "isEnable": true
    }','{
        "delay": 60,
        "isEnable": true
    }','{}','Device battery low','2022-02-01 04:33:40.072+00','2022-02-01 04:33:40.072+00')
    ON CONFLICT (alert_type) DO NOTHING;
    delete from template_contents where key ='lowBattery';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('b620c817-edff-4aa2-97a1-d24e84da65fe', 'lowBattery', 'en-US', '{
        "body": "Low battery alert for  {{device_code}}, and alert message is {{alert_message}} ",
        "subject": "Device battery low alert"
    }', '{
        "body": "Low battery alert for {{device_code}}, and alert message is {{alert_message}} "
    }', '{
        "body": "Low battery alert for {{device_code}}, and alert message is {{alert_message}} ",
        "title": "Low battery alert message"
    }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'alert');
    
    `);
    // checked in
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantCheckedIn';
INSERT INTO public.activity_log_communication_configs(
	id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
	VALUES ('62cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantCheckedIn',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantCheckedIn';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f020c817-edff-4aa2-97a1-d24e84da65fe', 'OccupantCheckedIn', 'en-US', '{
          "body": "Hi {{email}}, <br/> <br/> You have been checked-in to the location below <br/> <br/> Location: <br/> <b> {{access_to}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}}<br/><br/></mj-text> <mj-button font-size=\\"20px\\"  font-family=\\"Poppins\\" background-color=\\"#24a0ed\\" color=\\"white\\" padding-top=\\"200\\" inner-padding=\\"5px 10px\\" align=\\"center\\" font-weight:\\"normal\\" href=\\"https://salusmobileapp.page.link/Tbeh\\"> Get Connected </mj-button> <mj-text font-size=\\"18px\\" color=\\"{{textColor}}\\" font-family=\\"Poppins\\">",
          "subject": "CheckIn Update"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-in"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-in",
          "title": "CheckIn Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
    // occupant invite canceled
    await queryInterface.sequelize.query(` delete from activity_log_communication_configs where event_name ='OccupantInviteDeleted';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('63cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantInviteDeleted',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantInviteDeleted';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f023c817-edff-4aa2-97a1-d24e84da65fe', 'OccupantInviteDeleted', 'en-US', '{
        "body": "Welcome, {{old.inviter_email}} has cancelled your invitation to new smart home as occupant. <br/> <br/> You have no access to: <br/> <b> {{old.access_to}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}}",
        "subject": "Invitation Cancelled"
    }', '{
          "body": "Hi {{email}}, <br/> <br/> your invitation has cancelled"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> your invitation has cancelled",
          "title": "Invitation Cancelled"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    
    
    `);
    // checked out
    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantCheckedOut';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('64cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantCheckedOut',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantCheckedOut';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f120c817-edff-4aa2-97a1-d24e84da65fe', 'OccupantCheckedOut', 'en-US', '{
          "body": "Hi {{email}}, <br/> <br/> You have been checked-out from the location below <br/> <br/> Location: <br/> <b> {{access_to}}. </b> <br/> <br/> If you have any questions please contact your administrator at {{company_link}}<br/><br/></mj-text> <mj-button font-size=\\"20px\\"  font-family=\\"Poppins\\" background-color=\\"#24a0ed\\" color=\\"white\\" padding-top=\\"200\\" inner-padding=\\"5px 10px\\" align=\\"center\\" font-weight:\\"normal\\" href=\\"https://salusmobileapp.page.link/Tbeh\\"> Get Connected </mj-button> <mj-text font-size=\\"18px\\" color=\\"{{textColor}}\\" font-family=\\"Poppins\\">",
          "subject": "CheckOut Update"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-out"
        }', '{
          "body": "Hi {{email}}, <br/> <br/> you have been checked-out",
          "title": "CheckOut Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    
    `);
    // invited occupant check in location  updated
    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantInviteOfCheckInUpdated';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('65cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantInviteOfCheckInUpdated',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantInviteOfCheckInUpdated';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('f130c817-edff-4aa2-97a1-d24e84da65fe', 'OccupantInviteOfCheckInUpdated', 'en-US', '{
          "body": "Welcome, {{inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{access_to}}. </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{expires_at}} <br/> <br/> If you have any questions please contact your administrator at {{company_link}}<br/><br/></mj-text> <mj-button font-size=\\"20px\\"  font-family=\\"Poppins\\" background-color=\\"#24a0ed\\" color=\\"white\\" padding-top=\\"200\\" inner-padding=\\"5px 10px\\" align=\\"center\\" font-weight:\\"normal\\" href=\\"https://salusmobileapp.page.link/Tbeh\\"> Get Connected </mj-button> <mj-text font-size=\\"18px\\" color=\\"{{textColor}}\\" font-family=\\"Poppins\\">",
          "subject": "OccupantInviteCheckIn Update"
        }', '{
          "body": "Welcome, {{inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> This invite is valid till {{expires_at}}"
        }', '{
          "body": "Welcome, {{inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> This invite is valid till {{expires_at}} ",
          "title": "OccupantInviteCheckIn Update"
        }', '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    
    
    `);
    // occupant registered
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantRegistered';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('66cd55e9-8311-4f8c-850f-995985c694bb', 'OccupantRegistered',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantRegistered';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('607cdc2b-7da8-4fd4-b813-3a3d783ee2b3', 'OccupantRegistered', 'en-US', '{
        "body": "Welcome {{new.email}}, <br/> You have registered successfully to {{company_name}}, If you have any questions please contact your administrator at {{company_link}}<br/>",
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
        "body": "Hi  {{inviter_email}} ,<br/>occupant {{new.email}} you have invited joined successfully  to {{company_name}}.",
        "subject": "Invited Occupant joined  {{company_name}}"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
    // occupant permission added
    await queryInterface.sequelize.query(`delete from activity_log_communication_configs where event_name ='OccupantPermissionAdded';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('71cd55e0-8311-4f8c-850f-995985c694bb', 'OccupantPermissionAdded',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantPermissionAdded';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('e0741817-edff-4aa2-97a1-d24e84da65fd', 'OccupantPermissionAdded', 'en-US', '{
        "body": "Hi  {{new.UserEmail}} ,<br/> you have provided the access permissions for gateway {{new.GatewayID}} successfully  ",
        "subject": "Access Permissions Provided"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    
    `);
    // occupant resent
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantInviteResent';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('72cd55e0-8311-4f8c-850f-995985c694bb', 'OccupantInviteResent',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantInviteResent';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('e0341817-edff-4aa2-97a1-d24e84da65fd', 'OccupantInviteResent', 'en-US', '{
        "body": "Welcome, {{new.inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{new.access_to}}. </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{new.expires_at}} <br/> <br/> If you have any questions please contact your administrator at {{company_link}}<br/> <br/></mj-text> <mj-button font-size=\\"20px\\"  font-family=\\"Poppins\\" background-color=\\"#24a0ed\\" color=\\"white\\" padding-top=\\"200\\" inner-padding=\\"5px 10px\\" align=\\"center\\" font-weight:\\"normal\\" href=\\"https://salusmobileapp.page.link/Tbeh\\"> Get Connected </mj-button> <mj-text font-size=\\"18px\\" color=\\"{{textColor}}\\" font-family=\\"Poppins\\">",
        "subject": "Invitation Resent"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
    // occupant invite added
    await queryInterface.sequelize.query(` delete from activity_log_communication_configs where event_name ='OccupantInviteAdded';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('73cd55e0-8311-4f8c-850f-995985c694bb', 'OccupantInviteAdded',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantInviteAdded';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('e0e9d7ec-edff-4aa2-97a1-d24e84da65fd', 'OccupantInviteAdded', 'en-US', '{
        "body": "Welcome, {{new.inviter_email}} has invited you to your new smart home as occupant. <br/> <br/> You now have access to: <br/> <b> {{new.access_to}}. </b> <br/> <br/> Get connected by creating an occupant or log in with your existing account to access your devices. <br/> <br/> This invite is valid till {{new.expires_at}} <br/> <br/> If you have any questions please contact your administrator at {{company_link}}<br/> <br/></mj-text> <mj-button font-size=\\"20px\\"  font-family=\\"Poppins\\" background-color=\\"#24a0ed\\" color=\\"white\\" padding-top=\\"200\\" inner-padding=\\"5px 10px\\" align=\\"center\\" font-weight:\\"normal\\" href=\\"https://salusmobileapp.page.link/Tbeh\\"> Get Connected </mj-button> <mj-text font-size=\\"18px\\" color=\\"{{textColor}}\\" font-family=\\"Poppins\\">",
        "subject": "New Invitation"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
    // occupant permission updated
    await queryInterface.sequelize.query(`
    delete from activity_log_communication_configs where event_name ='OccupantPermissionUpdated';
    INSERT INTO public.activity_log_communication_configs(
      id, event_name, email_enabled, sms_enabled, notification_enabled, placeholders, created_at, updated_at)
      VALUES ('74cd55e0-8311-4f8c-850f-995985c694bb', 'OccupantPermissionUpdated',true, false,false, '{}',  '2022-02-03 08:33:28.35+00',  '2022-02-03 08:33:28.35+00');
    delete from template_contents where key ='OccupantPermissionUpdated';
    INSERT INTO public.template_contents(
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('a002d7ec-edff-4aa2-97a1-d24e84da65fd', 'OccupantPermissionUpdated', 'en-US', '{
        "body": "Hi  {{new.UserEmail}} ,<br/> you have provided the access permissions for gateway {{new.GatewayID}} successfully  ",
        "subject": "Access Permissions Provided"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');`);
  },

  down: async (queryInterface, Sequelize) => {
  },
};
