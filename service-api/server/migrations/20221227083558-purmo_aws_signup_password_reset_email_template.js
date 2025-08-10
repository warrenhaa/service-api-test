'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // signup EN
    await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp.purmo' and language = 'en';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('22bd491c-0788-4c54-896e-05cce961c489', 'SignUp.purmo', 'en', '{
    "body": "<p>Thank you for creating your profile. Your confirmation code is \\"<b>{{OTP}}</b>\\", it will be expired after 24 hours.</p> </br> <p> Once your account is confirmed, we\’ll walk you through the rest of the set-up process.</p> </br> <p>Welcome to {{welcome_company}}!</p>",
    "banner": "Welcome {{username}}!",
    "subject": "Please Confirm Your {{email_subject}} Account"
  }', '{
    "body": "<p>Thank you for creating your profile. Your confirmation code is \\"<b>{{OTP}}</b>\\", it will be expired after 24 hours.</p> </br> <p> Once your account is confirmed, we\’ll walk you through the rest of the set-up process.</p> </br> <p>Welcome to {{welcome_company}}!</p>"
  }', '{
    "body": "<p>Thank you for creating your profile. Your confirmation code is \\"<b>{{OTP}}</b>\\", it will be expired after 24 hours.</p> </br> <p> Once your account is confirmed, we\’ll walk you through the rest of the set-up process.</p> </br> <p>Welcome to {{welcome_company}}!</p>",
    "subject": "Please Confirm Your {{email_subject}} Account"
}','2022-12-23 08:33:28.35+00', '2022-12-23 08:33:28.35+00', 'signup');
 `);

    // signup DE
    await queryInterface.sequelize.query(`
 delete from template_contents where key ='SignUp.purmo' and language = 'de';
 INSERT INTO public.template_contents(   
    id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
    VALUES ('fb48d304-34b1-4b31-bb35-13c0371bcc7e', 'SignUp.purmo', 'de', '{
     "body": "<p> Danke, dass Sie {{welcome_company}} nutzen!</p> </br> <p>Der Bestätigungscode lautet \\"<b>{{OTP}}</b>\\" und ist 24 Stunden gültig. Bitte geben Sie diesen Code in der App ein, um die Mail-Adresse zu bestätigen. Folgen Sie danach den Hinweisen in der App, um die Registrierung abzuschließen.</p> </br> <p>Viel Spaß mit {{welcome_company}}!</p>",
     "banner": "Willkommen {{username}}!",
     "subject": "Bitte bestätigen Sie ihre {{email_subject}} Registrierung."
   }', '{
    "body": "<p> Danke, dass Sie {{welcome_company}} nutzen!</p> </br> <p>Der Bestätigungscode lautet \\"<b>{{OTP}}</b>\\" und ist 24 Stunden gültig. Bitte geben Sie diesen Code in der App ein, um die Mail-Adresse zu bestätigen. Folgen Sie danach den Hinweisen in der App, um die Registrierung abzuschließen.</p> </br> <p>Viel Spaß mit {{welcome_company}}!</p>"
  }', '{
    "body": "<p> Danke, dass Sie {{welcome_company}} nutzen!</p> </br> <p>Der Bestätigungscode lautet \\"<b>{{OTP}}</b>\\" und ist 24 Stunden gültig. Bitte geben Sie diesen Code in der App ein, um die Mail-Adresse zu bestätigen. Folgen Sie danach den Hinweisen in der App, um die Registrierung abzuschließen.</p> </br> <p>Viel Spaß mit {{welcome_company}}!</p>",
     "subject": "Bitte bestätigen Sie ihre {{email_subject}} Registrierung."
 }','2022-12-23 08:33:28.35+00', '2022-12-23 08:33:28.35+00', 'signup');
  `);

    // signup SV
    await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp.purmo' and language = 'sv';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('b3662503-3ed9-4aa6-b3c5-57acf96b0a23', 'SignUp.purmo', 'sv', '{
  "body": "<p>Tack för att du skapat ett konto. Din konfirmationskod är \\"<b>{{OTP}}</b>\\", den är giltig i 24 timmar.</p> </br> <p>När ditt konto är registrerat kommer vi att gå igenom resten av installationsprocessen.</p> </br> <p>Välkommen till {{welcome_company}}!</p>",
  "banner": "Välkommen {{username}}!",
  "subject": "Vänligen bekräfta ditt {{email_subject}} konto"
}', '{  
  "body": "<p>Tack för att du skapat ett konto. Din konfirmationskod är \\"<b>{{OTP}}</b>\\", den är giltig i 24 timmar.</p> </br> <p>När ditt konto är registrerat kommer vi att gå igenom resten av installationsprocessen.</p> </br> <p>Välkommen till {{welcome_company}}!</p>"
}', '{
  "body": "<p>Tack för att du skapat ett konto. Din konfirmationskod är \\"<b>{{OTP}}</b>\\", den är giltig i 24 timmar.</p> </br> <p>När ditt konto är registrerat kommer vi att gå igenom resten av installationsprocessen.</p> </br> <p>Välkommen till {{welcome_company}}!</p>",
  "subject": "Vänligen bekräfta ditt {{email_subject}} konto"
}','2022-12-23 08:33:28.35+00', '2022-12-23 08:33:28.35+00', 'signup');
`);

    // password en
    await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset.purmo' and language = 'en';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('66acd061-57d2-4f01-ae4a-8a6f17cc6c91', 'PasswordReset.purmo', 'en', '{
    "body": "<p>We received your password reset request. Your One Time Password to reset the password is \\"<b>{{OTP}}</b>\\", which will expire after 24 hours.</p> </br> <p>If you didn\’t request this reset or changed your mind, you can ignore this message; no action is needed.</p> </br> <p>Your {{welcome_company}} Service Team</p>",
    "banner": "Hello {{username}}",
    "subject": "Your password reset request"
  }', '{
    "body": "<p>We received your password reset request. Your One Time Password to reset the password is \\"<b>{{OTP}}</b>\\", which will expire after 24 hours.</p> </br> <p>If you didn\’t request this reset or changed your mind, you can ignore this message; no action is needed.</p> </br> <p>Your {{welcome_company}} Service Team</p>"
  }', '{
    "body": "<p>We received your password reset request. Your One Time Password to reset the password is \\"<b>{{OTP}}</b>\\", which will expire after 24 hours.</p> </br> <p>If you didn\’t request this reset or changed your mind, you can ignore this message; no action is needed.</p> </br> <p>Your {{welcome_company}} Service Team</p>",
    "subject": "Your password reset request"
}','2022-12-23 08:33:28.35+00', '2022-12-23 08:33:28.35+00', 'passwordreset');
 `);

    // password de
    await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset.purmo' and language = 'de';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('20b5b986-3e67-44ab-bdcf-d3e6c945a62c', 'PasswordReset.purmo', 'de', '{
    "body": "<p>Wir haben Ihre Anforderung zum Rücksetzen des Passworts erhalten. Bitte nutzen Sie diesen Code \\"<b>{{OTP}}</b>\\", um den Vorgang fortzusetzen. Der Code ist 24 Stunden gültig.</p> </br> <p>Wenn Sie keine Rücksetzung beantragt haben oder mittlerweile die Meinung geändert haben, dann brauchen Sie jetzt nichts zu tun.</p> </br> <p> Viele Grüße <br/> Ihr {{welcome_company}} Service Team</p>",
    "banner": "Hallo {{username}}",
    "subject": "Ihr Passwort wurde zurückgesetzt."
  }', '{
    "body": "<p>Wir haben Ihre Anforderung zum Rücksetzen des Passworts erhalten. Bitte nutzen Sie diesen Code \\"<b>{{OTP}}</b>\\", um den Vorgang fortzusetzen. Der Code ist 24 Stunden gültig.</p> </br> <p>Wenn Sie keine Rücksetzung beantragt haben oder mittlerweile die Meinung geändert haben, dann brauchen Sie jetzt nichts zu tun.</p> </br> <p> Viele Grüße <br/> Ihr {{welcome_company}} Service Team</p>"
  }', '{
    "body": "<p>Wir haben Ihre Anforderung zum Rücksetzen des Passworts erhalten. Bitte nutzen Sie diesen Code \\"<b>{{OTP}}</b>\\", um den Vorgang fortzusetzen. Der Code ist 24 Stunden gültig.</p> </br> <p>Wenn Sie keine Rücksetzung beantragt haben oder mittlerweile die Meinung geändert haben, dann brauchen Sie jetzt nichts zu tun.</p> </br> <p> Viele Grüße <br/> Ihr {{welcome_company}} Service Team</p>",
    "subject": "Ihr Passwort wurde zurückgesetzt."
}','2022-12-23 08:33:28.35+00', '2022-12-23 08:33:28.35+00', 'passwordreset');
 `);

    // password sv
    await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset.purmo' and language = 'sv';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('730f097c-147f-478d-a6b0-e8e1a153bd19', 'PasswordReset.purmo', 'sv', '{
  "body": "<p>Vi har mottagit din begäran om ett nytt lösenord. Din engångskod är \\"<b>{{OTP}}</b>\\", den är giltig i 24 timmar.</p> </br> <p>Om du inte gjort denna begäran eller ändrat dig så kan du strunta i det här meddelandet, då behöver du inte göra någonting.</p> </br> <p> Funderingar eller i behov av hjälp? Läs på våra Supportsidor för värdefull information.</p> </br> <p>Hälsningar från ditt {{welcome_company}} Service Team</p>",
  "banner": "Hej {{username}}",
  "subject": "Din återställningsbegäran"
}', '{  
  "body": "<p>Vi har mottagit din begäran om ett nytt lösenord. Din engångskod är \\"<b>{{OTP}}</b>\\", den är giltig i 24 timmar.</p> </br> <p>Om du inte gjort denna begäran eller ändrat dig så kan du strunta i det här meddelandet, då behöver du inte göra någonting.</p> </br> <p> Funderingar eller i behov av hjälp? Läs på våra Supportsidor för värdefull information.</p> </br> <p>Hälsningar från ditt {{welcome_company}} Service Team</p>"
}', '{
  "body": "<p>Vi har mottagit din begäran om ett nytt lösenord. Din engångskod är \\"<b>{{OTP}}</b>\\", den är giltig i 24 timmar.</p> </br> <p>Om du inte gjort denna begäran eller ändrat dig så kan du strunta i det här meddelandet, då behöver du inte göra någonting.</p> </br> <p> Funderingar eller i behov av hjälp? Läs på våra Supportsidor för värdefull information.</p> </br> <p>Hälsningar från ditt {{welcome_company}} Service Team</p>",
  "subject": "Din återställningsbegäran"
}','2022-12-23 08:33:28.35+00', '2022-12-23 08:33:28.35+00', 'passwordreset');
`);

  },

  async down(queryInterface, Sequelize) {
  }
};
