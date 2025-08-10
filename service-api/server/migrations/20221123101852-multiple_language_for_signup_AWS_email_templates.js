'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   // signup EN
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'en';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('56b0401e-9819-459e-87a4-aa9fc561cde9', 'SignUp', 'en', '{
    "body": "<p> Thank you for creating your profile. Please confirm your account now. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p>  <p>Once your account is confirmed, we’ll walk you through the rest of the set-up process.</p> <p>Welcome to {{welcome_company}}!</p>",
    "banner": "Welcome {{username}}!",
    "subject": "Please Confirm Your {{email_subject}} Account"
  }', '{
    "body": "<p> Thank you for creating your profile. Please confirm your account now. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.    </p>    <p>Once your account is confirmed, we’ll walk you through the rest of the set-up process.</p>    <p>Welcome to {{welcome_company}}!</p>"
}', '{
 "body": "<p> Thank you for creating your profile. Please confirm your account now. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.    </p>    <p>Once your account is confirmed, we’ll walk you through the rest of the set-up process.</p>    <p>Welcome to {{welcome_company}}!</p>",
 "subject": "Please Confirm Your {{email_subject}} Account"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
 `);
   //signup.omnie EN
 await queryInterface.sequelize.query(`
 delete from template_contents where key ='SignUp.omnie' and language = 'en';
 INSERT INTO public.template_contents(   
    id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
    VALUES ('99515f96-1ed4-4177-bdf0-b62598234afe', 'SignUp.omnie', 'en', '{
     "body": "<p> Thank you for creating your profile. Please confirm your account now. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p>  <p>Once your account is confirmed, we’ll walk you through the rest of the set-up process.</p> <p>Thank you</p>",
     "banner": "Welcome {{username}}!",
     "subject": "Please Confirm Your {{email_subject}} Account"
   }', '{
     "body": "<p> Thank you for creating your profile. Please confirm your account now. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.    </p>    <p>Once your account is confirmed, we’ll walk you through the rest of the set-up process.</p> <p>Thank you</p>"
 }', '{
  "body": "<p> Thank you for creating your profile. Please confirm your account now. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.    </p>    <p>Once your account is confirmed, we’ll walk you through the rest of the set-up process.</p> <p>Thank you</p>",
  "subject": "Please Confirm Your {{email_subject}} Account"
 }','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
  `);

   // signup BG
   await queryInterface.sequelize.query(`
   delete from template_contents where key ='SignUp' and language = 'bg';
   INSERT INTO public.template_contents(   
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('1ec869fa-ac66-4d36-b615-673717e96a5c', 'SignUp', 'bg', '{
       "body": "<p>Благодарим Ви, че създадохте Вашия профил. Моля потвърдете акаунта си сега. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p>  <p>Веднага след потвърждението на акаунта ще продължим процеса на настройка.</p>  <p>Добре дошли в {{welcome_company}}!</p>",
       "banner": "Добре дошли {{username}}!",
       "subject": "Моля потвърдете Вашия акаунт в {{email_subject}}"
     }', '{
      "body": "<p>Благодарим Ви, че създадохте Вашия профил. Моля потвърдете акаунта си сега. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p>  <p>Веднага след потвърждението на акаунта ще продължим процеса на настройка.</p>  <p>Добре дошли в {{welcome_company}}!</p>"
    }', '{
      "body": "<p>Благодарим Ви, че създадохте Вашия профил. Моля потвърдете акаунта си сега. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p>  <p>Веднага след потвърждението на акаунта ще продължим процеса на настройка.</p>  <p>Добре дошли в {{welcome_company}}!</p>",
      "subject": "Моля потвърдете Вашия акаунт в {{email_subject}}"
   }','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
    `);

 // signup CS
 await queryInterface.sequelize.query(`
 delete from template_contents where key ='SignUp' and language = 'cs';
 INSERT INTO public.template_contents(   
    id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
    VALUES ('cd7e6dfa-b27c-4d55-aeb9-36d8d094cccf', 'SignUp', 'cs', '{
     "body": " <p> Děkujeme Vám za vytvoření uživatelského účtu. Prosím, nyní potvrďte Váš účet. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Jakmile bude Váš účet potvrzen, provedeme Vás zbytkem procesu nastavení.</p>  <p>Vítejte do {{welcome_company}}!</p>",
     "banner": "Vítej {{username}}!",
     "subject": "Prosím Potvrďte Váš Účet {{email_subject}}"
   }', '{
    "body": " <p> Děkujeme Vám za vytvoření uživatelského účtu. Prosím, nyní potvrďte Váš účet. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Jakmile bude Váš účet potvrzen, provedeme Vás zbytkem procesu nastavení.</p>  <p>Vítejte do {{welcome_company}}!</p>"
  }', '{
    "body": " <p> Děkujeme Vám za vytvoření uživatelského účtu. Prosím, nyní potvrďte Váš účet. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Jakmile bude Váš účet potvrzen, provedeme Vás zbytkem procesu nastavení.</p>  <p>Vítejte do {{welcome_company}}!</p>",
    "subject": "Prosím Potvrďte Váš Účet {{email_subject}}"
 }','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
  `);

   // signup DA
 await queryInterface.sequelize.query(`
 delete from template_contents where key ='SignUp' and language = 'da';
 INSERT INTO public.template_contents(   
    id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
    VALUES ('eaec7233-80e0-41d1-acdd-d48579b7143c', 'SignUp', 'da', '{
     "body": " <p> Tak, fordi du har oprettet din profil. Bekræft din konto nu. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Når din konto er bekræftet, hjælper vi dig gennem resten af processen.</p> <p>Velkommen til {{welcome_company}}!</p>",
     "banner": "Velkommen {{username}}!",
     "subject": "Bekræft din {{email_subject}}-konto"
   }', '{
    "body": " <p> Tak, fordi du har oprettet din profil. Bekræft din konto nu. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Når din konto er bekræftet, hjælper vi dig gennem resten af processen.</p> <p>Velkommen til {{welcome_company}}!</p>"
  }', '{
    "body": " <p> Tak, fordi du har oprettet din profil. Bekræft din konto nu. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Når din konto er bekræftet, hjælper vi dig gennem resten af processen.</p> <p>Velkommen til {{welcome_company}}!</p>",
    "subject": "Bekræft din {{email_subject}}-konto"
 }','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
  `);

     // signup DE
 await queryInterface.sequelize.query(`
 delete from template_contents where key ='SignUp' and language = 'de';
 INSERT INTO public.template_contents(   
    id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
    VALUES ('17f0e8da-a014-42e5-987c-47bd006fd686', 'SignUp', 'de', '{
     "body": "  <p> Danke, dass Sie Ihr Profil erstellt haben. Bitte bestätigen Sie Ihr Konto jetzt. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Sobald Ihr Konto bestätigt ist, führen wir Sie Schritt für Schritt durch den weitereb Einrichtungsvorgang.</p> <p>Welcome to the {{welcome_company}}!</p>",
     "banner": "Willkommen {{username}}!",
     "subject": "Bitte bestätigen Sie Ihr {{email_subject}}-konto"
   }', '{
    "body": "  <p> Danke, dass Sie Ihr Profil erstellt haben. Bitte bestätigen Sie Ihr Konto jetzt. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Sobald Ihr Konto bestätigt ist, führen wir Sie Schritt für Schritt durch den weitereb Einrichtungsvorgang.</p> <p>Welcome to the {{welcome_company}}!</p>"
  }', '{
    "body": "  <p> Danke, dass Sie Ihr Profil erstellt haben. Bitte bestätigen Sie Ihr Konto jetzt. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Sobald Ihr Konto bestätigt ist, führen wir Sie Schritt für Schritt durch den weitereb Einrichtungsvorgang.</p> <p>Welcome to the {{welcome_company}}!</p>",
    "subject": "Bitte bestätigen Sie Ihr {{email_subject}}-konto"
 }','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
  `);

  // signup EL
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'el';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('9b5d750c-c455-412d-9cac-1820cbaceff8', 'SignUp', 'el', '{
  "body": "<p> Σας ευχαριστούμε για τη δημιουργία του προφίλ σας. Παρακαλούμε επιβεβαιώστε τώρα τον λογαριασμό σας. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Μόλις επιβεβαιωθεί ο λογαριασμός σας, θα σας μεταφέρουμε στην υπόλοιπη διαδικασία ρύθμισης.</p> <p>Καλώς ήρθατε στη {{welcome_company}}!</p>",
  "banner": "Καλώς ήρθατε {{username}}!",
  "subject": "Παρακαλώ επιβεβαιώστε τον {{email_subject}} Λογαριασμό σας"
}', '{  
  "body": "<p> Σας ευχαριστούμε για τη δημιουργία του προφίλ σας. Παρακαλούμε επιβεβαιώστε τώρα τον λογαριασμό σας. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Μόλις επιβεβαιωθεί ο λογαριασμός σας, θα σας μεταφέρουμε στην υπόλοιπη διαδικασία ρύθμισης.</p> <p>Καλώς ήρθατε στη {{welcome_company}}!</p>"
}', '{
  "body": "<p> Σας ευχαριστούμε για τη δημιουργία του προφίλ σας. Παρακαλούμε επιβεβαιώστε τώρα τον λογαριασμό σας. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Μόλις επιβεβαιωθεί ο λογαριασμός σας, θα σας μεταφέρουμε στην υπόλοιπη διαδικασία ρύθμισης.</p> <p>Καλώς ήρθατε στη {{welcome_company}}!</p>",
  "subject": "Παρακαλώ επιβεβαιώστε τον {{email_subject}} Λογαριασμό σας"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup ES
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'es';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('f62fdc2a-856e-4ca8-8ecf-f3189dcd51b2', 'SignUp', 'es', '{
  "body": "<p> Gracias por crear su perfil. Confirme ahora su cuenta. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Una vez que confirme su cuenta, le guiaremos a través del resto del proceso de instalación.</p> <p>Bienvenido a {{welcome_company}}!</p>",
  "banner": "Bienvenido {{username}}!",
  "subject": "Confirme su cuenta {{email_subject}}"
}', '{  
  "body": "<p> Gracias por crear su perfil. Confirme ahora su cuenta. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Una vez que confirme su cuenta, le guiaremos a través del resto del proceso de instalación.</p> <p>Bienvenido a {{welcome_company}}!</p>"
}', '{
  "body": "<p> Gracias por crear su perfil. Confirme ahora su cuenta. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Una vez que confirme su cuenta, le guiaremos a través del resto del proceso de instalación.</p> <p>Bienvenido a {{welcome_company}}!</p>",
  "subject": "Confirme su cuenta {{email_subject}}"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup ET
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'et';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('a24ea424-aaf2-482c-86d9-9ea538009c17', 'SignUp', 'et', '{
  "body": "<p> Täname profiili loomise eest. Palun kinnitage oma konto. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Pärast konto kinnitamist juhendame teid seadistusprotsessi lõpuleviimisel.</p> <p>Tere tulemast kasutama {{welcome_company}}!</p>",
  "banner": "Tere tulemast, {{username}}!",
  "subject": "Palun kinnitage oma {{email_subject}}\'\'e konto"
}', '{  
  "body": "<p> Täname profiili loomise eest. Palun kinnitage oma konto. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Pärast konto kinnitamist juhendame teid seadistusprotsessi lõpuleviimisel.</p> <p>Tere tulemast kasutama {{welcome_company}}!</p>"
}', '{
  "body": "<p> Täname profiili loomise eest. Palun kinnitage oma konto. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Pärast konto kinnitamist juhendame teid seadistusprotsessi lõpuleviimisel.</p> <p>Tere tulemast kasutama {{welcome_company}}!</p>",
  "subject": "Palun kinnitage oma {{email_subject}}\'\'e konto"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup FI
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'fi';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('4e3048e6-47bb-4078-aba7-0cff84f0bed1', 'SignUp', 'fi', '{
  "body": "<p> Kiitos profiilin luomisesta. Ole hyvä ja vahvista tunnuksesi. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Kun tunnuksesi on vahvistettu, avustamme sinua asennuksen muissa osissa.</p> <p>Tervetuloa {{welcome_company}}!</p>",
  "banner": "Tervetuloa {{username}}!",
  "subject": "Ole hyvä ja varmista {{email_subject}}-tunnuksesi"
}', '{  
  "body": "<p> Kiitos profiilin luomisesta. Ole hyvä ja vahvista tunnuksesi. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Kun tunnuksesi on vahvistettu, avustamme sinua asennuksen muissa osissa.</p> <p>Tervetuloa {{welcome_company}}!</p>"
 }', '{
  "body": "<p> Kiitos profiilin luomisesta. Ole hyvä ja vahvista tunnuksesi. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Kun tunnuksesi on vahvistettu, avustamme sinua asennuksen muissa osissa.</p> <p>Tervetuloa {{welcome_company}}!</p>",
  "subject": "Ole hyvä ja varmista {{email_subject}}-tunnuksesi"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup FR
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'fr';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('4fae79c8-5c91-4a57-a8ab-ec37dbf2c668', 'SignUp', 'fr', '{
  "body": "<p> Merci d\'\'avoir créé votre profile. Veuillez désormais confirmer votre compte. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Une fois votre compte confirmé, nous vous accompagnerons dans le reste du processus de configuration.</p> <p>Bienvenue aux {{welcome_company}}!</p>",
  "banner": "Bienvenue {{username}}!",
  "subject": "Veuillez confirmer votre compte {{email_subject}}"
}', '{  
  "body": "<p> Merci d\'\'avoir créé votre profile. Veuillez désormais confirmer votre compte. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Une fois votre compte confirmé, nous vous accompagnerons dans le reste du processus de configuration.</p> <p>Bienvenue aux {{welcome_company}}!</p>"
 }', '{
  "body": "<p> Merci d\'\'avoir créé votre profile. Veuillez désormais confirmer votre compte. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Une fois votre compte confirmé, nous vous accompagnerons dans le reste du processus de configuration.</p> <p>Bienvenue aux {{welcome_company}}!</p>",
  "subject": "Veuillez confirmer votre compte {{email_subject}}"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup NL
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'nl';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('7bc4e391-7965-4aee-9771-2c1d4ec1d6ce', 'SignUp', 'nl', '{
  "body": " <p> Uw profiel is aangemaakt. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Zodra uw account bevestigd is, nemen we de rest van het proces met u door.</p> <p>Welkom bij {{welcome_company}}!</p>",
  "banner": "Welkom {{username}}!",
  "subject": "Bevestig uw {{email_subject}}-account"
}', '{  
  "body": " <p> Uw profiel is aangemaakt. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Zodra uw account bevestigd is, nemen we de rest van het proces met u door.</p> <p>Welkom bij {{welcome_company}}!</p>"
 }', '{
  "body": " <p> Uw profiel is aangemaakt. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Zodra uw account bevestigd is, nemen we de rest van het proces met u door.</p> <p>Welkom bij {{welcome_company}}!</p>",
 "subject": "Bevestig uw {{email_subject}}-account"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup NO
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'no';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('329445e3-8330-42d5-86e7-d7b481618ff4', 'SignUp', 'no', '{
  "body": " <p> Takk for at du oppretter din profil. Vennligst bekreft din konto nå. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Så snart din konto er bekreftet, vil vi veilede deg gjennom resten av oppsettprosessen.</p> <p>Velkommen til {{welcome_company}} Connected Solutions!</p>",
  "banner": "Velkommen {{username}}!",
  "subject": "Vennligst bekreft din {{email_subject}}-konto"
}', '{  
  "body": " <p> Takk for at du oppretter din profil. Vennligst bekreft din konto nå. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Så snart din konto er bekreftet, vil vi veilede deg gjennom resten av oppsettprosessen.</p> <p>Velkommen til {{welcome_company}} Connected Solutions!</p>"
 }', '{
  "body": " <p> Takk for at du oppretter din profil. Vennligst bekreft din konto nå. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Så snart din konto er bekreftet, vil vi veilede deg gjennom resten av oppsettprosessen.</p> <p>Velkommen til {{welcome_company}} Connected Solutions!</p>",
  "subject": "Vennligst bekreft din {{email_subject}}-konto"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup PL
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'pl';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('3850fa80-34a5-4892-958d-8e0a18cb6efd', 'SignUp', 'pl', '{
  "body": "<p> Dziękujemy za utworzenie profilu. Potwierdź teraz swoje konto. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Po potwierdzeniu konta, przeprowadzimy Cię przez pozostałą część procesu konfiguracji.</p> <p>Witamy w {{welcome_company}} Connected Solutions!</p>",
  "banner": "Witaj {{username}}!",
  "subject": "Potwierdź konto {{email_subject}}"
}', '{  
  "body": "<p> Dziękujemy za utworzenie profilu. Potwierdź teraz swoje konto. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Po potwierdzeniu konta, przeprowadzimy Cię przez pozostałą część procesu konfiguracji.</p> <p>Witamy w {{welcome_company}} Connected Solutions!</p>"
}', '{
  "body": "<p> Dziękujemy za utworzenie profilu. Potwierdź teraz swoje konto. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Po potwierdzeniu konta, przeprowadzimy Cię przez pozostałą część procesu konfiguracji.</p> <p>Witamy w {{welcome_company}} Connected Solutions!</p>",
  "subject": "Potwierdź konto {{email_subject}}"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup RO
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'ro';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('449f9126-86c4-4309-9c8e-872f1d0061d8', 'SignUp', 'ro', '{
  "body": "<p>Îți mulțumim pentru crearea profilului. Confirmă-ți contul acum. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p> După confirmarea contului, vom parcurge restul procesului de configurare.</p> <p>Bun venit!</p>",
  "banner": "Bun venit {{username}}!",
  "subject": "Confirmă-ți contul {{email_subject}}"
}', '{  
  "body": "<p>Îți mulțumim pentru crearea profilului. Confirmă-ți contul acum. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p> După confirmarea contului, vom parcurge restul procesului de configurare.</p> <p>Bun venit!</p>"
}', '{
  "body": "<p>Îți mulțumim pentru crearea profilului. Confirmă-ți contul acum. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p> După confirmarea contului, vom parcurge restul procesului de configurare.</p> <p>Bun venit!</p>",
   "subject": "Confirmă-ți contul {{email_subject}}"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup RU
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'ru';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('b61d80b2-3694-4973-b126-0e6830c87d13', 'SignUp', 'ru', '{
  "body": "<p>Спасибо, что создали аккаунт. Пожалуйста, подтвердите вашу учетную запись прямо сейчас. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>OКак только вы подтвердите вашу учетную запись, мы поможем вам выполнить настройку.</p> <p>Добро пожаловать в {{welcome_company}} Connected Solutions!</p>",
  "banner": "Здравствуйте, {{username}}!",
  "subject": "Пожалуйста, подтвердите вашу учетную запись {{email_subject}}"
}', '{  
  "body": "<p>Спасибо, что создали аккаунт. Пожалуйста, подтвердите вашу учетную запись прямо сейчас. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>OКак только вы подтвердите вашу учетную запись, мы поможем вам выполнить настройку.</p> <p>Добро пожаловать в {{welcome_company}} Connected Solutions!</p>"
}', '{
  "body": "<p>Спасибо, что создали аккаунт. Пожалуйста, подтвердите вашу учетную запись прямо сейчас. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>OКак только вы подтвердите вашу учетную запись, мы поможем вам выполнить настройку.</p> <p>Добро пожаловать в {{welcome_company}} Connected Solutions!</p>",
   "subject": "Пожалуйста, подтвердите вашу учетную запись {{email_subject}}"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup SR
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'sr';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('473bd6a3-033e-4722-8931-780ff5c95929', 'SignUp', 'sr', '{
  "body": "<p> Hvala što ste napravili svoji profil. Molim Vas potvrdite svoj nalog. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Kada je Vaš nalog potvrđen, idemo kroz ostatak procesa registrovanja.</p> <p>Dobrodošli u {{welcome_company}} Connected Solutions!</p>",
  "banner": "Dobrodošli {{username}}!",
  "subject": "Molimo Vas potvrdite svoj {{email_subject}} nalog"
}', '{  
  "body": "<p> Hvala što ste napravili svoji profil. Molim Vas potvrdite svoj nalog. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Kada je Vaš nalog potvrđen, idemo kroz ostatak procesa registrovanja.</p> <p>Dobrodošli u {{welcome_company}} Connected Solutions!</p>"
}', '{
  "body": "<p> Hvala što ste napravili svoji profil. Molim Vas potvrdite svoj nalog. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Kada je Vaš nalog potvrđen, idemo kroz ostatak procesa registrovanja.</p> <p>Dobrodošli u {{welcome_company}} Connected Solutions!</p>",
  "subject": "Molimo Vas potvrdite svoj {{email_subject}} nalog"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup SV
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'sv';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('6b3b0a4a-3fe3-4ecd-9fe8-ed10500cff98', 'SignUp', 'sv', '{
  "body": "<p> Tack för att du skapade din profil. Bekräfta ditt konto nu. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>När ditt konto har bekräftats hjälper vi dig med resten av konfigurationsprocessen.</p> <p>Välkommen till {{welcome_company}}!</p>",
  "banner": "Välkommen {{username}}!",
  "subject": "Bekräfta ditt {{email_subject}}-konto"
}', '{  
  "body": "<p> Tack för att du skapade din profil. Bekräfta ditt konto nu. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>När ditt konto har bekräftats hjälper vi dig med resten av konfigurationsprocessen.</p> <p>Välkommen till {{welcome_company}} Connected Solutions!</p>"
}', '{
  "body": "<p> Tack för att du skapade din profil. Bekräfta ditt konto nu. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>När ditt konto har bekräftats hjälper vi dig med resten av konfigurationsprocessen.</p> <p>Välkommen till {{welcome_company}} Connected Solutions!</p>",
  "subject": "Bekräfta ditt {{email_subject}}-konto"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup UK
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp' and language = 'uk';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('8142dae6-83b9-4b27-a509-3a1beab3bd2f', 'SignUp', 'uk', '{
  "body": "<p> Спасибі, що створили акаунт. Будь ласка, підтвердіть ваш обліковий запис прямо зараз. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Як тільки ви підтвердите свій обліковий запис, ми допоможемо вам налаштувати.</p> <p>Ласкаво просимо в {{welcome_company}} Connected Solutions!</p>",
  "banner": "Доброго дня, {{username}}!",
  "subject": "Будь ласка, підтвердіть ваш обліковий запис {{email_subject}}"
}', '{  
  "body": "<p> Спасибі, що створили акаунт. Будь ласка, підтвердіть ваш обліковий запис прямо зараз. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Як тільки ви підтвердите свій обліковий запис, ми допоможемо вам налаштувати.</p> <p>Ласкаво просимо в {{welcome_company}} Connected Solutions!</p>"
}', '{
  "body": "<p> Спасибі, що створили акаунт. Будь ласка, підтвердіть ваш обліковий запис прямо зараз. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Як тільки ви підтвердите свій обліковий запис, ми допоможемо вам налаштувати.</p> <p>Ласкаво просимо в {{welcome_company}} Connected Solutions!</p>",
  "subject": "Будь ласка, підтвердіть ваш обліковий запис {{email_subject}}"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// extra templates which are based on key.comany_code to serve the purpose of its language.
// signup.company_code ET
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp.salus-eu' and language = 'et';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('fef66d8b-8e55-41cd-b83f-1cd5e46099f7', 'SignUp.salus-eu', 'et', '{
  "body": "<p> Täname profiili loomise eest. Palun kinnitage oma konto. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Pärast konto kinnitamist juhendame teid seadistusprotsessi lõpuleviimisel.</p> <p>Tere tulemast kasutama SALUS\'\'e Ühendatud lahendusi!</p>",
  "banner": "Tere tulemast, {{username}}!",
  "subject": "Palun kinnitage oma {{email_subject}}\'\'e konto"
}', '{  
  "body": "<p> Täname profiili loomise eest. Palun kinnitage oma konto. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Pärast konto kinnitamist juhendame teid seadistusprotsessi lõpuleviimisel.</p> <p>Tere tulemast kasutama SALUS\'\'e Ühendatud lahendusi!</p>"
}', '{
  "body": "<p> Täname profiili loomise eest. Palun kinnitage oma konto. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Pärast konto kinnitamist juhendame teid seadistusprotsessi lõpuleviimisel.</p> <p>Tere tulemast kasutama SALUS\'\'e Ühendatud lahendusi!</p>",
  "subject": "Palun kinnitage oma {{email_subject}}\'\'e konto"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);


// signup.company_code FI
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp.salus-eu' and language = 'fi';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('0b205815-42bf-4088-ab2e-6d6bd1278c51', 'SignUp.salus-eu', 'fi', '{
  "body": "<p> Kiitos profiilin luomisesta. Ole hyvä ja vahvista tunnuksesi. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Kun tunnuksesi on vahvistettu, avustamme sinua asennuksen muissa osissa.</p> <p>Tervetuloa SALUS Connected Solutionsiin!</p>",
  "banner": "Tervetuloa {{username}}!",
  "subject": "Ole hyvä ja varmista {{email_subject}}-tunnuksesi"
}', '{  
  "body": "<p> Kiitos profiilin luomisesta. Ole hyvä ja vahvista tunnuksesi. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Kun tunnuksesi on vahvistettu, avustamme sinua asennuksen muissa osissa.</p> <p>Tervetuloa SALUS Connected Solutionsiin!</p>"
 }', '{
  "body": "<p> Kiitos profiilin luomisesta. Ole hyvä ja vahvista tunnuksesi. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours. </p> <p>Kun tunnuksesi on vahvistettu, avustamme sinua asennuksen muissa osissa.</p> <p>Tervetuloa SALUS Connected Solutionsiin!</p>",
  "subject": "Ole hyvä ja varmista {{email_subject}}-tunnuksesi"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup.company_code FR
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp.salus-eu' and language = 'fr';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('7230e5ba-c248-407a-b634-749a6eac44a1', 'SignUp.salus-eu', 'fr', '{
  "body": "<p> Merci d\'\'avoir créé votre profile. Veuillez désormais confirmer votre compte. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Une fois votre compte confirmé, nous vous accompagnerons dans le reste du processus de configuration.</p> <p>Bienvenue aux Solutions connectées SALUS !</p>",
  "banner": "Bienvenue {{username}}!",
  "subject": "Veuillez confirmer votre compte {{email_subject}}"
}', '{  
  "body": "<p> Merci d\'\'avoir créé votre profile. Veuillez désormais confirmer votre compte. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Une fois votre compte confirmé, nous vous accompagnerons dans le reste du processus de configuration.</p> <p>Bienvenue aux Solutions connectées SALUS !</p>"
 }', '{
  "body": "<p> Merci d\'\'avoir créé votre profile. Veuillez désormais confirmer votre compte. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Une fois votre compte confirmé, nous vous accompagnerons dans le reste du processus de configuration.</p> <p>Bienvenue aux Solutions connectées SALUS !</p>",
  "subject": "Veuillez confirmer votre compte {{email_subject}}"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

// signup.company_code NL
await queryInterface.sequelize.query(`
delete from template_contents where key ='SignUp.salus-eu' and language = 'nl';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('3e543bc3-8f09-4e07-b162-e5d0daa7d024', 'SignUp.salus-eu', 'nl', '{
  "body": " <p> Uw profiel is aangemaakt. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Zodra uw account bevestigd is, nemen we de rest van het proces met u door.</p> <p>Welkom bij Connected Solutions van SALUS!</p>",
  "banner": "Welkom {{username}}!",
  "subject": "Bevestig uw {{email_subject}}-account"
}', '{  
  "body": " <p> Uw profiel is aangemaakt. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Zodra uw account bevestigd is, nemen we de rest van het proces met u door.</p> <p>Welkom bij Connected Solutions van SALUS!</p>"
 }', '{
  "body": " <p> Uw profiel is aangemaakt. Your confirmation code is <b>{{OTP}}</b>, it will be expired after 24 hours.</p> <p>Zodra uw account bevestigd is, nemen we de rest van het proces met u door.</p> <p>Welkom bij Connected Solutions van SALUS!</p>",
 "subject": "Bevestig uw {{email_subject}}-account"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'signup');
`);

  },

  async down (queryInterface, Sequelize) {   
  }
};
