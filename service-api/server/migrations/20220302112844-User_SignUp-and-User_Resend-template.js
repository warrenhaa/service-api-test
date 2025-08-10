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
        "body": "<b> Welcome {{email}} </b> </br> </br> <p> {{inviter_email}} invited you to join Development. Please click the button below to accept this invitation to register and access Development portal </p> </br> </br> </mj-text> <mj-button font-size=\\"20px\\"  font-family=\\"Poppins\\" background-color=\\"#24a0ed\\" color=\\"white\\" padding-top=\\"200\\" inner-padding=\\"5px 10px\\" align=\\"center\\" font-weight:\\"normal\\" href=\\"{{button_link}}\\"> ACCEPT INVITATION </mj-button> <mj-text font-size=\\"18px\\" color=\\"{{textColor}}\\" font-family=\\"Poppins\\"> <p> Your invite expires on {{expires_at}} </p> If you have any questions or trouble, please contact  <a href=\\"{{contact_url}}\\">Developement</a> </br> </br> <p> Cheers, </p> </br> </br> The Development Team <br/> <br/> </br>",
        "subject": "Smart-Property Management Sign Up"
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
        "body": "<b> Welcome {{email}} </b> </br> </br> <p> {{inviter_email}} invited you to join Development. Please click the button below to accept this invitation to register and access Development portal </p> </br> </br> </mj-text> <mj-button font-size=\\"20px\\"  font-family=\\"Poppins\\" background-color=\\"#24a0ed\\" color=\\"white\\" padding-top=\\"200\\" inner-padding=\\"5px 10px\\" align=\\"center\\" font-weight:\\"normal\\" href=\\"{{button_link}}\\"> ACCEPT INVITATION </mj-button> <mj-text font-size=\\"18px\\" color=\\"{{textColor}}\\" font-family=\\"Poppins\\"> <p> Your invite expires on {{expires_at}} </p> If you have any questions or trouble, please contact  <a href=\\"{{contact_url}}\\">Developement</a> </br> </br> <p> Cheers, </p> </br> </br> The Development Team <br/> <br/> </br>",
       "subject": "Smart-Property Management Sign Up"
    }', null, null, '2022-02-03 08:33:28.35+00', '2022-02-03 08:33:28.35+00', 'activity');
    `);
  },
  down: async (queryInterface, Sequelize) => { },
};
