'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   // PasswordReset EN
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'en';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('a5245455-2c05-4499-92b0-5f2de5b87e4d', 'PasswordReset', 'en', '{
    "body": "<p> We received your password reset request. Please reset your password now. Your OTP to reset the password is <b>{{OTP}}</b>, Your reset request will expire in 24 hours and this OTP is only good for one use </p> <p>If you didn\’t request this reset or changed your mind, you can ignore this message; no action is needed.</p> <p>Concerns or need assistance? Check our Support pages for helpful information.</p> <p>Your {{welcome_company}} Service Team</p>",
    "banner": "Hello {{username}}",
    "subject": "Your Reset Request"
  }', '{
    "body": "<p> We received your password reset request. Please reset your password now. Your OTP to reset the password is <b>{{OTP}}</b>, Your reset request will expire in 24 hours and this OTP is only good for one use </p> <p>If you didn\’t request this reset or changed your mind, you can ignore this message; no action is needed.</p> <p>Concerns or need assistance? Check our Support pages for helpful information.</p> <p>Your {{welcome_company}} Service Team</p>"
   }', '{
    "body": "<p> We received your password reset request. Please reset your password now. Your OTP to reset the password is <b>{{OTP}}</b>, Your reset request will expire in 24 hours and this OTP is only good for one use </p> <p>If you didn\’t request this reset or changed your mind, you can ignore this message; no action is needed.</p> <p>Concerns or need assistance? Check our Support pages for helpful information.</p> <p>Your {{welcome_company}} Service Team</p>",
    "subject": "Your Reset Request"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
 `);
  
   // PasswordReset BG
   await queryInterface.sequelize.query(`
   delete from template_contents where key ='PasswordReset' and language = 'bg';
   INSERT INTO public.template_contents(   
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('6708ea36-5215-49f0-a3b6-877f93204411', 'PasswordReset', 'bg', '{
       "body": "<p > Получихме Вашата заявка за промяна на паролата. Моля променете Вашата парола сега. Your OTP to reset the password is <b>{{OTP}}</b>, Заявката за промяна изтича след 24 часа и OTP е активен еднократно. </p> <p>В случай, че не сте поискали промяна на паролата или сте променили мнението си игнoрирайте това съобщение; не се налага да променяте нищо.</p> <p>Имате нижда от съдействие? Посетете страницата ни за техническа поддръжка за полезна информация.</p> <p>Екипът на {{welcome_company}}</p>",
       "banner": "Здравей {{username}}",
       "subject": "Заявка за промяна на парола"
     }', '{
      "body": "<p > Получихме Вашата заявка за промяна на паролата. Моля променете Вашата парола сега. Your OTP to reset the password is <b>{{OTP}}</b>, Заявката за промяна изтича след 24 часа и OTP е активен еднократно. </p> <p>В случай, че не сте поискали промяна на паролата или сте променили мнението си игнoрирайте това съобщение; не се налага да променяте нищо.</p> <p>Имате нижда от съдействие? Посетете страницата ни за техническа поддръжка за полезна информация.</p> <p>Екипът на {{welcome_company}}</p>"
    }', '{
      "body": "<p > Получихме Вашата заявка за промяна на паролата. Моля променете Вашата парола сега. Your OTP to reset the password is <b>{{OTP}}</b>, Заявката за промяна изтича след 24 часа и OTP е активен еднократно. </p> <p>В случай, че не сте поискали промяна на паролата или сте променили мнението си игнoрирайте това съобщение; не се налага да променяте нищо.</p> <p>Имате нижда от съдействие? Посетете страницата ни за техническа поддръжка за полезна информация.</p> <p>Екипът на {{welcome_company}}</p>",
      "subject": "Заявка за промяна на парола"
   }','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
    `);

 // PasswordReset CS
 await queryInterface.sequelize.query(`
 delete from template_contents where key ='PasswordReset' and language = 'cs';
 INSERT INTO public.template_contents(   
    id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
    VALUES ('124c409a-6950-4d15-93cc-56159c225fd5', 'PasswordReset', 'cs', '{
     "body": "<p>Obdrželi jsme Váš požadavek na reset hesla. Prosím, resetujte nyní Vaše heslo. Your OTP to reset the password is <b>{{OTP}}</b>, Váš požadavek resetu vyprší za 24 hodin a OTP je pouze pro jedno použití.</p> <p>Pokud jste nežádali o reset nebo jste si to rozmysleli, můžete ignorovat tuto zprávu. Není nutná žádná další akce.</p> <p>Jste zmateni nebo potřebujete pomoc? Podívejte se na stránky Podpory pro užitečné informace.</p> <p>Váš {{welcome_company}} Service Team</p>",
     "banner": "Ahoj {{username}}",
     "subject": "Váš Požadavek Resetu"
   }', '{
    "body": "<p>Obdrželi jsme Váš požadavek na reset hesla. Prosím, resetujte nyní Vaše heslo. Your OTP to reset the password is <b>{{OTP}}</b>, Váš požadavek resetu vyprší za 24 hodin a OTP je pouze pro jedno použití.</p> <p>Pokud jste nežádali o reset nebo jste si to rozmysleli, můžete ignorovat tuto zprávu. Není nutná žádná další akce.</p> <p>Jste zmateni nebo potřebujete pomoc? Podívejte se na stránky Podpory pro užitečné informace.</p> <p>Váš {{welcome_company}} Service Team</p>"
       }', '{
      "body": "<p>Obdrželi jsme Váš požadavek na reset hesla. Prosím, resetujte nyní Vaše heslo. Your OTP to reset the password is <b>{{OTP}}</b>, Váš požadavek resetu vyprší za 24 hodin a OTP je pouze pro jedno použití.</p> <p>Pokud jste nežádali o reset nebo jste si to rozmysleli, můžete ignorovat tuto zprávu. Není nutná žádná další akce.</p> <p>Jste zmateni nebo potřebujete pomoc? Podívejte se na stránky Podpory pro užitečné informace.</p> <p>Váš {{welcome_company}} Service Team</p>",
      "subject": "Váš Požadavek Resetu"
 }','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
  `);

   // PasswordReset DA
 await queryInterface.sequelize.query(`
 delete from template_contents where key ='PasswordReset' and language = 'da';
 INSERT INTO public.template_contents(   
    id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
    VALUES ('941f9e47-e3e4-4813-92f1-ac8b5c249c1a', 'PasswordReset', 'da', '{
     "body": " <p>Vi har modtaget din anmodning om nulstilling af adgangskode. Du kan nulstille din adgangskode nu. Your OTP to reset the password is <b>{{OTP}}</b>, Nulstillingsanmodningen udløber om 24 timer og dette OTP gælder kun en gang.</p> <p>Hvis du ikke har anmodet om nulstilling, eller hvis du har ombestemt dig, kan du ignorere denne meddelelse og behøver ikke fortage dig noget.</p> <p>Hvis du spørgsmål eller brug for hjælp, kan du finde få flere oplysninger på vores supportsider.</p> <p>{{welcome_company}} Service-team</p>",
     "banner": "Hej {{username}}",
     "subject": "Anmodning om nulstilling"
   }', '{
    "body": " <p>Vi har modtaget din anmodning om nulstilling af adgangskode. Du kan nulstille din adgangskode nu. Your OTP to reset the password is <b>{{OTP}}</b>, Nulstillingsanmodningen udløber om 24 timer og dette OTP gælder kun en gang.</p> <p>Hvis du ikke har anmodet om nulstilling, eller hvis du har ombestemt dig, kan du ignorere denne meddelelse og behøver ikke fortage dig noget.</p> <p>Hvis du spørgsmål eller brug for hjælp, kan du finde få flere oplysninger på vores supportsider.</p> <p>{{welcome_company}} Service-team</p>"
  }', '{
    "body": " <p>Vi har modtaget din anmodning om nulstilling af adgangskode. Du kan nulstille din adgangskode nu. Your OTP to reset the password is <b>{{OTP}}</b>, Nulstillingsanmodningen udløber om 24 timer og dette OTP gælder kun en gang.</p> <p>Hvis du ikke har anmodet om nulstilling, eller hvis du har ombestemt dig, kan du ignorere denne meddelelse og behøver ikke fortage dig noget.</p> <p>Hvis du spørgsmål eller brug for hjælp, kan du finde få flere oplysninger på vores supportsider.</p> <p>{{welcome_company}} Service-team</p>",
    "subject": "Anmodning om nulstilling"
 }','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
  `);

     // PasswordReset DE
 await queryInterface.sequelize.query(`
 delete from template_contents where key ='PasswordReset' and language = 'de';
 INSERT INTO public.template_contents(   
    id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
    VALUES ('c5bde446-a370-4290-9e95-ed756fe3223f', 'PasswordReset', 'de', '{
     "body": "<p> Wir haben Ihre Anfrage zur Zurücksetzung des Passworts erhalten. Bitte setzen Sie Ihr Passwort jetzt zurück. Your OTP to reset the password is <b>{{OTP}}</b>, Ihre Anfrage wird in 24 Stunden ungültig und dieser OTP ist nur einmal verwendbar.</p> <p>Wenn Sie diese Zurücksetzung nicht angefordert haben oder nicht mehr benötigen, ignorieren Sie einfach diese Nachricht; Sie müssen nichts weiter tun.</p> <p>Probleme oder brauchen Sie Hilfe? Auf unseren Kundendienstseiten finden Sie nützliche Informationen.</p> <p>Ihr {{welcome_company}} Kundendienstteam</p>",
     "banner": "Hallo {{username}}",
     "subject": "Ihre Zurücksetzungsanfrage"
   }', '{
    "body": "<p> Wir haben Ihre Anfrage zur Zurücksetzung des Passworts erhalten. Bitte setzen Sie Ihr Passwort jetzt zurück. Your OTP to reset the password is <b>{{OTP}}</b>, Ihre Anfrage wird in 24 Stunden ungültig und dieser OTP ist nur einmal verwendbar.</p> <p>Wenn Sie diese Zurücksetzung nicht angefordert haben oder nicht mehr benötigen, ignorieren Sie einfach diese Nachricht; Sie müssen nichts weiter tun.</p> <p>Probleme oder brauchen Sie Hilfe? Auf unseren Kundendienstseiten finden Sie nützliche Informationen.</p> <p>Ihr {{welcome_company}} Kundendienstteam</p>"
      }', '{
        "body": "<p> Wir haben Ihre Anfrage zur Zurücksetzung des Passworts erhalten. Bitte setzen Sie Ihr Passwort jetzt zurück. Your OTP to reset the password is <b>{{OTP}}</b>, Ihre Anfrage wird in 24 Stunden ungültig und dieser OTP ist nur einmal verwendbar.</p> <p>Wenn Sie diese Zurücksetzung nicht angefordert haben oder nicht mehr benötigen, ignorieren Sie einfach diese Nachricht; Sie müssen nichts weiter tun.</p> <p>Probleme oder brauchen Sie Hilfe? Auf unseren Kundendienstseiten finden Sie nützliche Informationen.</p> <p>Ihr {{welcome_company}} Kundendienstteam</p>",
         "subject": "Ihre Zurücksetzungsanfrage"
 }','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
  `);

  // PasswordReset EL
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'el';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('d26a1790-3f7a-4218-a489-e7a61407f3b9', 'PasswordReset', 'el', '{
  "body": " <p > Λάβαμε το αίτημα επαναφοράς του κωδικού πρόσβασής σας. Παρακαλώ επαναφέρετε τώρα τον κωδικό πρόσβασής σας. Your OTP to reset the password is <b>{{OTP}}</b>, Το αίτημα για την επαναφορά του κωδικού πρόσβασης θα λήξει σε 24 ώρες και αυτός ο OTP είναι μόνο για μια χρήση.</p> <p>Εάν δεν ζητήσατε αυτή την επαναφορά ή αλλάξατε γνώμη, μπορείτε να αγνοήσετε αυτό το μήνυμα; δεν απαιτείται καμία ενέργεια.</p> <p>Aντιμετωπίζετε προβλήματα ή χρειάζεστε βοήθεια; Ελέγξτε τις σελίδες Υποστήριξης για χρήσιμες πληροφορίες.</p> <p>Η ομάδα εξυπηρέτησης της {{welcome_company}}</p>",
  "banner": "Γειά σας {{username}}",
  "subject": "Το Αίτημά σας για Επαναφορά"
}', '{  
  "body": " <p > Λάβαμε το αίτημα επαναφοράς του κωδικού πρόσβασής σας. Παρακαλώ επαναφέρετε τώρα τον κωδικό πρόσβασής σας. Your OTP to reset the password is <b>{{OTP}}</b>, Το αίτημα για την επαναφορά του κωδικού πρόσβασης θα λήξει σε 24 ώρες και αυτός ο OTP είναι μόνο για μια χρήση.</p> <p>Εάν δεν ζητήσατε αυτή την επαναφορά ή αλλάξατε γνώμη, μπορείτε να αγνοήσετε αυτό το μήνυμα; δεν απαιτείται καμία ενέργεια.</p> <p>Aντιμετωπίζετε προβλήματα ή χρειάζεστε βοήθεια; Ελέγξτε τις σελίδες Υποστήριξης για χρήσιμες πληροφορίες.</p> <p>Η ομάδα εξυπηρέτησης της {{welcome_company}}</p>"
}', '{
  "body": " <p > Λάβαμε το αίτημα επαναφοράς του κωδικού πρόσβασής σας. Παρακαλώ επαναφέρετε τώρα τον κωδικό πρόσβασής σας. Your OTP to reset the password is <b>{{OTP}}</b>, Το αίτημα για την επαναφορά του κωδικού πρόσβασης θα λήξει σε 24 ώρες και αυτός ο OTP είναι μόνο για μια χρήση.</p> <p>Εάν δεν ζητήσατε αυτή την επαναφορά ή αλλάξατε γνώμη, μπορείτε να αγνοήσετε αυτό το μήνυμα; δεν απαιτείται καμία ενέργεια.</p> <p>Aντιμετωπίζετε προβλήματα ή χρειάζεστε βοήθεια; Ελέγξτε τις σελίδες Υποστήριξης για χρήσιμες πληροφορίες.</p> <p>Η ομάδα εξυπηρέτησης της {{welcome_company}}</p>",
  "subject": "Το Αίτημά σας για Επαναφορά"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset ES
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'es';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('8ce0bab8-e58d-4402-b51b-66bc9824640c', 'PasswordReset', 'es', '{
  "body": " <p > Hemos recibido su solicitud de cambio de contraseña. Resetee su contraseña ahora. Your OTP to reset the password is <b>{{OTP}}</b>, Su petición expirará en 24 horas y este OTP solo tiene un uso.</p> <p>Si no ha solicitado este cambio o ha cambiado de idea, puede ignorar este mensaje; no se requiere acción alguna.</p> <p>Le preocupa algo o necesita ayuda? Lea nuestra página de soporte para obtener información útil.</p> <p>Su equipo de servicio {{welcome_company}}</p>",
  "banner": "Hola {{username}}",
  "subject": "Su petición de reset"
}', '{  
  "body": " <p > Hemos recibido su solicitud de cambio de contraseña. Resetee su contraseña ahora. Your OTP to reset the password is <b>{{OTP}}</b>, Su petición expirará en 24 horas y este OTP solo tiene un uso.</p> <p>Si no ha solicitado este cambio o ha cambiado de idea, puede ignorar este mensaje; no se requiere acción alguna.</p> <p>Le preocupa algo o necesita ayuda? Lea nuestra página de soporte para obtener información útil.</p> <p>Su equipo de servicio {{welcome_company}}</p>"
  }', '{
    "body": " <p > Hemos recibido su solicitud de cambio de contraseña. Resetee su contraseña ahora. Your OTP to reset the password is <b>{{OTP}}</b>, Su petición expirará en 24 horas y este OTP solo tiene un uso.</p> <p>Si no ha solicitado este cambio o ha cambiado de idea, puede ignorar este mensaje; no se requiere acción alguna.</p> <p>Le preocupa algo o necesita ayuda? Lea nuestra página de soporte para obtener información útil.</p> <p>Su equipo de servicio {{welcome_company}}</p>",
   "subject": "Su petición de reset"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset ET
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'et';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('17bf76db-76b9-413b-9b49-2f239de1c736', 'PasswordReset', 'et', '{
  "body": "<p > Saime kätte teie parooli muutmise taotluse. Palun lähtestage oma parool kohe. Your OTP to reset the password is <b>{{OTP}}</b>, Teie lähtestamise taotlus aegub 24 tunni pärast ja antud OTP saab kasutada ainult üks kord.</p> <p>Kui te pole soovinud parooli lähtestada või olete meelt muutnud, võite seda teadet ignoreerida; te ei pea midagi tegema.</p> <p>Tekkis küsimusi või vajate abi? Vaadake meie Klienditoe lehti, kust leiate abiinfot.</p> <p>Teie {{welcome_company}} meeskond</p>",
  "banner": "Tere, {{username}}",
  "subject": "Teie lähtestustaotlus"
}', '{  
  "body": "<p > Saime kätte teie parooli muutmise taotluse. Palun lähtestage oma parool kohe. Your OTP to reset the password is <b>{{OTP}}</b>, Teie lähtestamise taotlus aegub 24 tunni pärast ja antud OTP saab kasutada ainult üks kord.</p> <p>Kui te pole soovinud parooli lähtestada või olete meelt muutnud, võite seda teadet ignoreerida; te ei pea midagi tegema.</p> <p>Tekkis küsimusi või vajate abi? Vaadake meie Klienditoe lehti, kust leiate abiinfot.</p> <p>Teie {{welcome_company}} meeskond</p>"
}', '{
  "body": "<p > Saime kätte teie parooli muutmise taotluse. Palun lähtestage oma parool kohe. Your OTP to reset the password is <b>{{OTP}}</b>, Teie lähtestamise taotlus aegub 24 tunni pärast ja antud OTP saab kasutada ainult üks kord.</p> <p>Kui te pole soovinud parooli lähtestada või olete meelt muutnud, võite seda teadet ignoreerida; te ei pea midagi tegema.</p> <p>Tekkis küsimusi või vajate abi? Vaadake meie Klienditoe lehti, kust leiate abiinfot.</p> <p>Teie {{welcome_company}} meeskond</p>",
  "subject": "Teie lähtestustaotlus"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset FI
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'fi';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('611ff4d6-94ec-48fe-a7fb-0f013bf70352', 'PasswordReset', 'fi', '{
  "body": "<p> Vastaanotimme salasanan resetointipyynnön. Resetoi salasanasi nyt. Your OTP to reset the password is <b>{{OTP}}</b>, Resetointipyyntö lakkaa olemasta voimassa 24 tunnin jälkeen ja OTP voi käyttää vain kerran.</p> <p>Jos et pyytänyt tätä resetointia tai muutit mielesi, voit olla huomioimatta tätä viestiä. Tällöin ei ole tarvetta jatkotoimenpiteille.</p> <p>Huolia tai tarvitset avustusta? Vieraile meidän Tukisivustoillamme, joista löydät hyödyllistä tietoa.</p> <p>Sinun {{welcome_company}} Service -tiimi</p>",
  "banner": "Hei {{username}}",
  "subject": "Resetointipyyntö"
}', '{  
  "body": "<p> Vastaanotimme salasanan resetointipyynnön. Resetoi salasanasi nyt. Your OTP to reset the password is <b>{{OTP}}</b>, Resetointipyyntö lakkaa olemasta voimassa 24 tunnin jälkeen ja OTP voi käyttää vain kerran.</p> <p>Jos et pyytänyt tätä resetointia tai muutit mielesi, voit olla huomioimatta tätä viestiä. Tällöin ei ole tarvetta jatkotoimenpiteille.</p> <p>Huolia tai tarvitset avustusta? Vieraile meidän Tukisivustoillamme, joista löydät hyödyllistä tietoa.</p> <p>Sinun {{welcome_company}} Service -tiimi</p>"
}', '{
  "body": "<p> Vastaanotimme salasanan resetointipyynnön. Resetoi salasanasi nyt. Your OTP to reset the password is <b>{{OTP}}</b>, Resetointipyyntö lakkaa olemasta voimassa 24 tunnin jälkeen ja OTP voi käyttää vain kerran.</p> <p>Jos et pyytänyt tätä resetointia tai muutit mielesi, voit olla huomioimatta tätä viestiä. Tällöin ei ole tarvetta jatkotoimenpiteille.</p> <p>Huolia tai tarvitset avustusta? Vieraile meidän Tukisivustoillamme, joista löydät hyödyllistä tietoa.</p> <p>Sinun {{welcome_company}} Service -tiimi</p>",
  "subject": "Resetointipyyntö"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset FR
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'fr';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('d1d8663a-3e81-4231-945c-1d8d2ed75bfe', 'PasswordReset', 'fr', '{
  "body": " <p> Nous avons bien reçu votre demande de réinitialisation de mot de passe. Veuillez maintenant réinitialiser votre mot de passe. Your OTP to reset the password is <b>{{OTP}}</b>, Vous demande de réinitialisation expirera dans 24 heures et ce OTP peut être utilisé qu\'\'une seule fois.</p> <p>Si vous n\'\'avez pas demandé cette réinitialisation ou si vous avez changé d\'\'avis, vous pouvez ignorer ce message ; aucune action n\'\'est nécessaire.</p> <p>Besoins d\'\'aide ou de renseignements ? Rendez-vous sur nos pages Assistance pour obtenir des informations utiles.</p> <p>Votre équipe de Service de {{welcome_company}}</p>",
  "banner": "Bonjour {{username}}",
  "subject": "Your Reset Request"
}', '{  
  "body": " <p> Nous avons bien reçu votre demande de réinitialisation de mot de passe. Veuillez maintenant réinitialiser votre mot de passe. Your OTP to reset the password is <b>{{OTP}}</b>, Vous demande de réinitialisation expirera dans 24 heures et ce OTP peut être utilisé qu\'\'une seule fois.</p> <p>Si vous n\'\'avez pas demandé cette réinitialisation ou si vous avez changé d\'\'avis, vous pouvez ignorer ce message ; aucune action n\'\'est nécessaire.</p> <p>Besoins d\'\'aide ou de renseignements ? Rendez-vous sur nos pages Assistance pour obtenir des informations utiles.</p> <p>Votre équipe de Service de {{welcome_company}}</p>"
 }', '{
  "body": " <p> Nous avons bien reçu votre demande de réinitialisation de mot de passe. Veuillez maintenant réinitialiser votre mot de passe. Your OTP to reset the password is <b>{{OTP}}</b>, Vous demande de réinitialisation expirera dans 24 heures et ce OTP peut être utilisé qu\'\'une seule fois.</p> <p>Si vous n\'\'avez pas demandé cette réinitialisation ou si vous avez changé d\'\'avis, vous pouvez ignorer ce message ; aucune action n\'\'est nécessaire.</p> <p>Besoins d\'\'aide ou de renseignements ? Rendez-vous sur nos pages Assistance pour obtenir des informations utiles.</p> <p>Votre équipe de Service de {{welcome_company}}</p>",
  "subject": "Your Reset Request"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset NL
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'nl';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('4b7a1fa9-6074-4715-9fb5-ad7fcded0d01', 'PasswordReset', 'nl', '{
  "body": "<p> We received your password reset request. Please reset your password now. Your OTP to reset the password is <b>{{OTP}}</b>, Your reset request will expire in 24 hours and this OTP is only good for one use.</p> <p>Indien u hier niet om gevraagd hebt of van gedachten veranderd bent, kunt u dit bericht negeren; u hoeft geen actie te ondernemen.</p> <p>Hebt u vragen of hebt u hulp nodig? Ga naar onze Ondersteuningspagina\'\'s voor handige informatie.</p> <p>Uw serviceteam van {{welcome_company}}</p>",
  "banner": "Hallo {{username}}",
  "subject": "Uw reset-verzoek"
}', '{  
  "body": "<p> We received your password reset request. Please reset your password now. Your OTP to reset the password is <b>{{OTP}}</b>, Your reset request will expire in 24 hours and this OTP is only good for one use.</p> <p>Indien u hier niet om gevraagd hebt of van gedachten veranderd bent, kunt u dit bericht negeren; u hoeft geen actie te ondernemen.</p> <p>Hebt u vragen of hebt u hulp nodig? Ga naar onze Ondersteuningspagina\'\'s voor handige informatie.</p> <p>Uw serviceteam van {{welcome_company}}</p>"
  }', '{
    "body": "<p> We received your password reset request. Please reset your password now. Your OTP to reset the password is <b>{{OTP}}</b>, Your reset request will expire in 24 hours and this OTP is only good for one use.</p> <p>Indien u hier niet om gevraagd hebt of van gedachten veranderd bent, kunt u dit bericht negeren; u hoeft geen actie te ondernemen.</p> <p>Hebt u vragen of hebt u hulp nodig? Ga naar onze Ondersteuningspagina\'\'s voor handige informatie.</p> <p>Uw serviceteam van {{welcome_company}}</p>",
    "subject": "Uw reset-verzoek"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset NO
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'no';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('a8883ad0-80f0-415b-ab24-6e98779b2981', 'PasswordReset', 'no', '{
  "body": "<p> Vi har fått din forespørsel om tilbakestilling av passord. Tilbakestill ditt passord nå. Your OTP to reset the password is <b>{{OTP}}</b>, Din forespørsel om tilbakestilling av passordet er kun gyldig i 24 timer og denne OTP kan kun brukes en gang.</p> <p>Om du ikke spurte om denne tilbakestillingen eller har ombestemt deg kan du bare overse denne meldingen; ingen handling er nødvendig.</p> <p>Bekymringer eller assistanse? Se våre støttesider for nyttig informasjon.</p> <p>Ditt {{welcome_company}} Serviceteam</p>",
  "banner": "Hello {{username}}",
  "subject": "Din nullstillingsordre"
}', '{  
  "body": "<p> Vi har fått din forespørsel om tilbakestilling av passord. Tilbakestill ditt passord nå. Your OTP to reset the password is <b>{{OTP}}</b>, Din forespørsel om tilbakestilling av passordet er kun gyldig i 24 timer og denne OTP kan kun brukes en gang.</p> <p>Om du ikke spurte om denne tilbakestillingen eller har ombestemt deg kan du bare overse denne meldingen; ingen handling er nødvendig.</p> <p>Bekymringer eller assistanse? Se våre støttesider for nyttig informasjon.</p> <p>Ditt {{welcome_company}} Serviceteam</p>"
}', '{
  "body": "<p> Vi har fått din forespørsel om tilbakestilling av passord. Tilbakestill ditt passord nå. Your OTP to reset the password is <b>{{OTP}}</b>, Din forespørsel om tilbakestilling av passordet er kun gyldig i 24 timer og denne OTP kan kun brukes en gang.</p> <p>Om du ikke spurte om denne tilbakestillingen eller har ombestemt deg kan du bare overse denne meldingen; ingen handling er nødvendig.</p> <p>Bekymringer eller assistanse? Se våre støttesider for nyttig informasjon.</p> <p>Ditt {{welcome_company}} Serviceteam</p>",
  "subject": "Din nullstillingsordre"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset PL
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'pl';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('2d0e313f-dc7b-455a-a5b9-c8ab7e3ea8e3', 'PasswordReset', 'pl', '{
  "body": "<p> Otrzymaliśmy od Ciebie prośbę o zresetowanie hasła. Zresetuj teraz swoje hasło. Your OTP to reset the password is <b>{{OTP}}</b>, Twoja prośba o zresetowanie hasła straci ważność za 24 godzin, a z OTP można skorzystać tylko jeden raz.</p> <p>Jeżeli nie prosiłeś(aś) o zresetowanie hasła lub zmnieniłeś(aś) zdanie, możesz zignorować tę wiadomość i nie musisz podejmować żadnych działań.</p> <p>Masz problemy lub potrzebujesz pomocy? Zapoznaj się z pomocnymi informacjami, które można znaleźć na stronach pomocy.</p> <p>Zespół ds. usług {{welcome_company}}</p>",
  "banner": "Witaj {{username}}",
  "subject": "Żądanie resetowania"
}', '{  
  "body": "<p> Otrzymaliśmy od Ciebie prośbę o zresetowanie hasła. Zresetuj teraz swoje hasło. Your OTP to reset the password is <b>{{OTP}}</b>, Twoja prośba o zresetowanie hasła straci ważność za 24 godzin, a z OTP można skorzystać tylko jeden raz.</p> <p>Jeżeli nie prosiłeś(aś) o zresetowanie hasła lub zmnieniłeś(aś) zdanie, możesz zignorować tę wiadomość i nie musisz podejmować żadnych działań.</p> <p>Masz problemy lub potrzebujesz pomocy? Zapoznaj się z pomocnymi informacjami, które można znaleźć na stronach pomocy.</p> <p>Zespół ds. usług {{welcome_company}}</p>"
}', '{
  "body": "<p> Otrzymaliśmy od Ciebie prośbę o zresetowanie hasła. Zresetuj teraz swoje hasło. Your OTP to reset the password is <b>{{OTP}}</b>, Twoja prośba o zresetowanie hasła straci ważność za 24 godzin, a z OTP można skorzystać tylko jeden raz.</p> <p>Jeżeli nie prosiłeś(aś) o zresetowanie hasła lub zmnieniłeś(aś) zdanie, możesz zignorować tę wiadomość i nie musisz podejmować żadnych działań.</p> <p>Masz problemy lub potrzebujesz pomocy? Zapoznaj się z pomocnymi informacjami, które można znaleźć na stronach pomocy.</p> <p>Zespół ds. usług {{welcome_company}}</p>",
  "subject": "Żądanie resetowania"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset RO
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'ro';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('7eda0c0c-505c-4a1c-ba51-430892dbce96', 'PasswordReset', 'ro', '{
  "body": "<p> Am primit solicitarea ta de resetare a parolei. Resetează-ți parola acum. Your OTP to reset the password is <b>{{OTP}}</b>, Solicitarea de resetare va expira în 24 ore și acest OTP poate folosit numai o singură dată.</p> <p>Dacă nu ai solicitat această resetare sau dacă te-ai răzgândit, poți ignora acest mesaj; nu trebuie să faci nimic.</p> <p>Ai neclarități sau dorești asistență? Vizitează paginile noastre de asistență pentru informații utile.</p> <p>Echipa de asistență</p>",
  "banner": "Salut {{username}}",
  "subject": "Resetare parolă"
}', '{  
  "body": "<p> Am primit solicitarea ta de resetare a parolei. Resetează-ți parola acum. Your OTP to reset the password is <b>{{OTP}}</b>, Solicitarea de resetare va expira în 24 ore și acest OTP poate folosit numai o singură dată.</p> <p>Dacă nu ai solicitat această resetare sau dacă te-ai răzgândit, poți ignora acest mesaj; nu trebuie să faci nimic.</p> <p>Ai neclarități sau dorești asistență? Vizitează paginile noastre de asistență pentru informații utile.</p> <p>Echipa de asistență</p>"
  }', '{
    "body": "<p> Am primit solicitarea ta de resetare a parolei. Resetează-ți parola acum. Your OTP to reset the password is <b>{{OTP}}</b>, Solicitarea de resetare va expira în 24 ore și acest OTP poate folosit numai o singură dată.</p> <p>Dacă nu ai solicitat această resetare sau dacă te-ai răzgândit, poți ignora acest mesaj; nu trebuie să faci nimic.</p> <p>Ai neclarități sau dorești asistență? Vizitează paginile noastre de asistență pentru informații utile.</p> <p>Echipa de asistență</p>",
    "subject": "Resetare parolă"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset RU
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'ru';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('bab248a3-46ad-489b-b230-b06688a1df94', 'PasswordReset', 'ru', '{
  "body": "<p> Мы получили ваш запрос на сброс пароля. Пожалуйста, сбросьте пароль прямо сейчас. Your OTP to reset the password is <b>{{OTP}}</b>, Ваш запрос истекает через 24 часов, и вы можете воспользоваться этой OTP только один раз.</p> <p>Если вы не запрашивали сброс пароля или передумали, то вы можете проигнорировать это сообщение. Никаких действий не требуется.</p> <p>Возникли вопросы или нужна помощь? На странице службы поддержки вы найдете много полезной информации.</p> <p>Ваша команда {{welcome_company}}</p>",
  "banner": "Привет, {{username}}",
  "subject": "Ваш запрос на сброс пароля"
}', '{  
  "body": "<p> Мы получили ваш запрос на сброс пароля. Пожалуйста, сбросьте пароль прямо сейчас. Your OTP to reset the password is <b>{{OTP}}</b>, Ваш запрос истекает через 24 часов, и вы можете воспользоваться этой OTP только один раз.</p> <p>Если вы не запрашивали сброс пароля или передумали, то вы можете проигнорировать это сообщение. Никаких действий не требуется.</p> <p>Возникли вопросы или нужна помощь? На странице службы поддержки вы найдете много полезной информации.</p> <p>Ваша команда {{welcome_company}}</p>"
 }', '{
  "body": "<p> Мы получили ваш запрос на сброс пароля. Пожалуйста, сбросьте пароль прямо сейчас. Your OTP to reset the password is <b>{{OTP}}</b>, Ваш запрос истекает через 24 часов, и вы можете воспользоваться этой OTP только один раз.</p> <p>Если вы не запрашивали сброс пароля или передумали, то вы можете проигнорировать это сообщение. Никаких действий не требуется.</p> <p>Возникли вопросы или нужна помощь? На странице службы поддержки вы найдете много полезной информации.</p> <p>Ваша команда {{welcome_company}}</p>",
  "subject": "Ваш запрос на сброс пароля"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset SR
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'sr';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('7f4bc0e4-447e-48e4-8f37-46585872cd59', 'PasswordReset', 'sr', '{
  "body": "<p> Primili smo Vaš zahtev za resetovanje lozinke. Molim Vas resetujte Vašu lozinku. Your OTP to reset the password is <b>{{OTP}}</b>, Vaš zahtev za resetovanje će isteći za 24 sati i ova OTP je dobra samo za jednu upotrebu.</p> <p>Ako niste zatražili ovo resetovanje ili ste promenili mišljenje, možete ignorisati ovu poruku; ni jedna akcija nije potrebna.</p> <p>Zabrinuti ste ili Vam treba pomoć? Proverite naše stranice sa podrškom za korisne informacije.</p> <p>Vaš {{welcome_company}} Servisni tim</p>",
  "banner": "Zdravo {{username}}",
  "subject": "Vaš zahtev za resetovanjem"
}', '{  
  "body": "<p> Primili smo Vaš zahtev za resetovanje lozinke. Molim Vas resetujte Vašu lozinku. Your OTP to reset the password is <b>{{OTP}}</b>, Vaš zahtev za resetovanje će isteći za 24 sati i ova OTP je dobra samo za jednu upotrebu.</p> <p>Ako niste zatražili ovo resetovanje ili ste promenili mišljenje, možete ignorisati ovu poruku; ni jedna akcija nije potrebna.</p> <p>Zabrinuti ste ili Vam treba pomoć? Proverite naše stranice sa podrškom za korisne informacije.</p> <p>Vaš {{welcome_company}} Servisni tim</p>"
}', '{
  "body": "<p> Primili smo Vaš zahtev za resetovanje lozinke. Molim Vas resetujte Vašu lozinku. Your OTP to reset the password is <b>{{OTP}}</b>, Vaš zahtev za resetovanje će isteći za 24 sati i ova OTP je dobra samo za jednu upotrebu.</p> <p>Ako niste zatražili ovo resetovanje ili ste promenili mišljenje, možete ignorisati ovu poruku; ni jedna akcija nije potrebna.</p> <p>Zabrinuti ste ili Vam treba pomoć? Proverite naše stranice sa podrškom za korisne informacije.</p> <p>Vaš {{welcome_company}} Servisni tim</p>",
  "subject": "Vaš zahtev za resetovanjem"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset SV
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'sv';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('b05a5276-23a7-4e7d-97b3-bf67b187c79d', 'PasswordReset', 'sv', '{
  "body": "<p> Vi har fått din begäran om lösenordsåterställning. Återställ ditt lösenord nu. Your OTP to reset the password is <b>{{OTP}}</b>, Din återställningsbegäran upphör att gälla om 24 timmar och den här OTP kan bara användas en gång.</p> <p>Om du inte begärde den här återställningen eller har ångrat dig, kan du strunta i det här meddelandet. Ingen åtgärd krävs.</p> <p>Har du frågor eller behöver du hjälp? På våra supportsidor hittar du användbar information.</p> <p>Ditt serviceteam hos {{welcome_company}}</p>",
  "banner": "Hej {{username}}",
  "subject": "Din återställningsbegäran"
}', '{  
  "body": "<p> Vi har fått din begäran om lösenordsåterställning. Återställ ditt lösenord nu. Your OTP to reset the password is <b>{{OTP}}</b>, Din återställningsbegäran upphör att gälla om 24 timmar och den här OTP kan bara användas en gång.</p> <p>Om du inte begärde den här återställningen eller har ångrat dig, kan du strunta i det här meddelandet. Ingen åtgärd krävs.</p> <p>Har du frågor eller behöver du hjälp? På våra supportsidor hittar du användbar information.</p> <p>Ditt serviceteam hos {{welcome_company}}</p>"
}', '{
  "body": "<p> Vi har fått din begäran om lösenordsåterställning. Återställ ditt lösenord nu. Your OTP to reset the password is <b>{{OTP}}</b>, Din återställningsbegäran upphör att gälla om 24 timmar och den här OTP kan bara användas en gång.</p> <p>Om du inte begärde den här återställningen eller har ångrat dig, kan du strunta i det här meddelandet. Ingen åtgärd krävs.</p> <p>Har du frågor eller behöver du hjälp? På våra supportsidor hittar du användbar information.</p> <p>Ditt serviceteam hos {{welcome_company}}</p>",
  "subject": "Din återställningsbegäran"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset UK
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset' and language = 'uk';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('61c8e836-f19a-4f09-8953-968cdc29965c', 'PasswordReset', 'uk', '{
  "body": "<p> Ми отримали ваш запит на скидання пароля. Будь ласка, скиньте пароль прямо зараз. Your OTP to reset the password is <b>{{OTP}}</b>, Ваш запит закінчується через 6 годин, і ви можете використовувати цей OTP лише один раз.</p> <p>Якщо ви не запитували скидання пароля або передумали, то ви можете проігнорувати це повідомлення. Ніяких дій не потрібно виконувати.</p> <p>Виникли питання або потрібна допомога? На сторінці служби підтримки ви знайдете багато корисної інформації.</p> <p>Ваша команда {{welcome_company}}</p>",
  "banner": "Привіт, {{username}}",
  "subject": "Ваш запит на скидання пароля"
}', '{  
  "body": "<p> Ми отримали ваш запит на скидання пароля. Будь ласка, скиньте пароль прямо зараз. Your OTP to reset the password is <b>{{OTP}}</b>, Ваш запит закінчується через 6 годин, і ви можете використовувати цей OTP лише один раз.</p> <p>Якщо ви не запитували скидання пароля або передумали, то ви можете проігнорувати це повідомлення. Ніяких дій не потрібно виконувати.</p> <p>Виникли питання або потрібна допомога? На сторінці служби підтримки ви знайдете багато корисної інформації.</p> <p>Ваша команда {{welcome_company}}</p>"
}', '{
  "body": "<p> Ми отримали ваш запит на скидання пароля. Будь ласка, скиньте пароль прямо зараз. Your OTP to reset the password is <b>{{OTP}}</b>, Ваш запит закінчується через 6 годин, і ви можете використовувати цей OTP лише один раз.</p> <p>Якщо ви не запитували скидання пароля або передумали, то ви можете проігнорувати це повідомлення. Ніяких дій не потрібно виконувати.</p> <p>Виникли питання або потрібна допомога? На сторінці служби підтримки ви знайдете багато корисної інформації.</p> <p>Ваша команда {{welcome_company}}</p>",
  "subject": "Ваш запит на скидання пароля"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

 // according to company wise extra templates
 
// PasswordReset.company_code ET
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset.salus-eu' and language = 'et';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('a2ae4905-55f2-47bf-917e-b6be634cf39c', 'PasswordReset.salus-eu', 'et', '{
  "body": "<p>Saime kätte teie parooli muutmise taotluse. Palun lähtestage oma parool kohe. Your OTP to reset the password is <b>{{OTP}}</b>, Teie lähtestamise taotlus aegub 24 tunni pärast ja antud OTP saab kasutada ainult üks kord.</p> <p>Kui te pole soovinud parooli lähtestada või olete meelt muutnud, võite seda teadet ignoreerida; te ei pea midagi tegema.</p> <p>Tekkis küsimusi või vajate abi? Vaadake meie Klienditoe lehti, kust leiate abiinfot.</p> <p>Teie SALUS\'\'e Ühendatud lahenduste meeskond</p>",
  "banner": "Tere, {{username}}",
  "subject": "Teie lähtestustaotlus"
}', '{  
  "body": "<p>Saime kätte teie parooli muutmise taotluse. Palun lähtestage oma parool kohe. Your OTP to reset the password is <b>{{OTP}}</b>, Teie lähtestamise taotlus aegub 24 tunni pärast ja antud OTP saab kasutada ainult üks kord.</p> <p>Kui te pole soovinud parooli lähtestada või olete meelt muutnud, võite seda teadet ignoreerida; te ei pea midagi tegema.</p> <p>Tekkis küsimusi või vajate abi? Vaadake meie Klienditoe lehti, kust leiate abiinfot.</p> <p>Teie SALUS\'\'e Ühendatud lahenduste meeskond</p>"
}', '{
  "body": "<p>Saime kätte teie parooli muutmise taotluse. Palun lähtestage oma parool kohe. Your OTP to reset the password is <b>{{OTP}}</b>, Teie lähtestamise taotlus aegub 24 tunni pärast ja antud OTP saab kasutada ainult üks kord.</p> <p>Kui te pole soovinud parooli lähtestada või olete meelt muutnud, võite seda teadet ignoreerida; te ei pea midagi tegema.</p> <p>Tekkis küsimusi või vajate abi? Vaadake meie Klienditoe lehti, kust leiate abiinfot.</p> <p>Teie SALUS\'\'e Ühendatud lahenduste meeskond</p>",
  "subject": "Teie lähtestustaotlus"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset.company_code FR
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset.salus-eu' and language = 'fr';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('226d9d69-6ec3-4469-be40-d1420604c458', 'PasswordReset.salus-eu', 'fr', '{
  "body": "<p>Nous avons bien reçu votre demande de réinitialisation de mot de passe. Veuillez maintenant réinitialiser votre mot de passe. Your OTP to reset the password is <b>{{OTP}}</b>,Vous demande de réinitialisation expirera dans 24 heures et ce OTP peut être utilisé qu\'\'une seule fois.</p> <p>Si vous n\'\'avez pas demandé cette réinitialisation ou si vous avez changé d\'\'avis, vous pouvez ignorer ce message ; aucune action n\'\'est nécessaire.</p> <p>Besoins d\'\'aide ou de renseignements ? Rendez-vous sur nos pages Assistance pour obtenir des informations utiles.</p> <p>Votre équipe de Service de Solutions Connectées SALUS</p>",
  "banner": "Bonjour {{username}}",
  "subject": "Your Reset Request"
}', '{  
  "body": "<p>Nous avons bien reçu votre demande de réinitialisation de mot de passe. Veuillez maintenant réinitialiser votre mot de passe. Your OTP to reset the password is <b>{{OTP}}</b>,Vous demande de réinitialisation expirera dans 24 heures et ce OTP peut être utilisé qu\'\'une seule fois.</p> <p>Si vous n\'\'avez pas demandé cette réinitialisation ou si vous avez changé d\'\'avis, vous pouvez ignorer ce message ; aucune action n\'\'est nécessaire.</p> <p>Besoins d\'\'aide ou de renseignements ? Rendez-vous sur nos pages Assistance pour obtenir des informations utiles.</p> <p>Votre équipe de Service de Solutions Connectées SALUS</p>"
}', '{
  "body": "<p>Nous avons bien reçu votre demande de réinitialisation de mot de passe. Veuillez maintenant réinitialiser votre mot de passe. Your OTP to reset the password is <b>{{OTP}}</b>,Vous demande de réinitialisation expirera dans 24 heures et ce OTP peut être utilisé qu\'\'une seule fois.</p> <p>Si vous n\'\'avez pas demandé cette réinitialisation ou si vous avez changé d\'\'avis, vous pouvez ignorer ce message ; aucune action n\'\'est nécessaire.</p> <p>Besoins d\'\'aide ou de renseignements ? Rendez-vous sur nos pages Assistance pour obtenir des informations utiles.</p> <p>Votre équipe de Service de Solutions Connectées SALUS</p>",
  "subject": "Your Reset Request"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

// PasswordReset.company_code NL
await queryInterface.sequelize.query(`
delete from template_contents where key ='PasswordReset.salus-eu' and language = 'nl';
INSERT INTO public.template_contents(   
 id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
 VALUES ('4973dca5-91cb-4890-a667-d84e520c789d', 'PasswordReset.salus-eu', 'nl', '{
  "body": "<p> We received your password reset request. Please reset your password now. Your OTP to reset the password is <b>{{OTP}}</b>, Your reset request will expire in 24 hours and this OTP is only good for one use.</p> <p>Indien u hier niet om gevraagd hebt of van gedachten veranderd bent, kunt u dit bericht negeren; u hoeft geen actie te ondernemen.</p> <p>Hebt u vragen of hebt u hulp nodig? Ga naar onze Ondersteuningspagina\'\'s voor handige informatie.</p> <p>Uw serviceteam van Connected Solution van SALUS</p>",
  "banner": "Hallo {{username}}",
  "subject": "Uw reset-verzoek"
}', '{  
  "body": "<p> We received your password reset request. Please reset your password now. Your OTP to reset the password is <b>{{OTP}}</b>, Your reset request will expire in 24 hours and this OTP is only good for one use.</p> <p>Indien u hier niet om gevraagd hebt of van gedachten veranderd bent, kunt u dit bericht negeren; u hoeft geen actie te ondernemen.</p> <p>Hebt u vragen of hebt u hulp nodig? Ga naar onze Ondersteuningspagina\'\'s voor handige informatie.</p> <p>Uw serviceteam van Connected Solution van SALUS</p>"
   }', '{
    "body": "<p> We received your password reset request. Please reset your password now. Your OTP to reset the password is <b>{{OTP}}</b>, Your reset request will expire in 24 hours and this OTP is only good for one use.</p> <p>Indien u hier niet om gevraagd hebt of van gedachten veranderd bent, kunt u dit bericht negeren; u hoeft geen actie te ondernemen.</p> <p>Hebt u vragen of hebt u hulp nodig? Ga naar onze Ondersteuningspagina\'\'s voor handige informatie.</p> <p>Uw serviceteam van Connected Solution van SALUS</p>",
   "subject": "Uw reset-verzoek"
}','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
`);

 //PasswordReset.omnie EN
 await queryInterface.sequelize.query(`
 delete from template_contents where key ='PasswordReset.omnie' and language = 'en';
 INSERT INTO public.template_contents(   
    id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
    VALUES ('8625598f-f9d7-46d8-9e5a-8da6513ca612', 'PasswordReset.omnie', 'en', '{
     "body": "<p>We have received a request to reset your password for your OMNIE Home account.</p> <p> You can paste the below reset code in your mobile app.</p> <p align = \\"center\\"> <b>{{OTP}}</b> </p> <p>If you haven\’t requested your password to be changed, you don\’t need to take any action.</p> <p>If you require any further assistance please call customer services on 01392 36 36 05 or email us <a href=\\"customer.service@omnie.co.uk\\">customer.service@omnie.co.uk </a></p> <p>Thank you</p>",
     "banner": "Hello {{username}}",
     "subject": "Your Reset Request"
   }', '{
    "body": "<p>We have received a request to reset your password for your OMNIE Home account.</p> <p> You can paste the below reset code in your mobile app.</p> <p align = \\"center\\"> <b>{{OTP}}</b> </p> <p>If you haven\’t requested your password to be changed, you don\’t need to take any action.</p> <p>If you require any further assistance please call customer services on 01392 36 36 05 or email us <a href=\\"customer.service@omnie.co.uk\\">customer.service@omnie.co.uk </a></p> <p>Thank you</p>"
     }', '{
      "body": "<p>We have received a request to reset your password for your OMNIE Home account.</p> <p> You can paste the below reset code in your mobile app.</p> <p align = \\"center\\"> <b>{{OTP}}</b> </p> <p>If you haven\’t requested your password to be changed, you don\’t need to take any action.</p> <p>If you require any further assistance please call customer services on 01392 36 36 05 or email us <a href=\\"customer.service@omnie.co.uk\\">customer.service@omnie.co.uk </a></p> <p>Thank you</p>",
      "subject": "Your Reset Request"
 }','2022-11-23 08:33:28.35+00', '2022-11-23 08:33:28.35+00', 'passwordreset');
  `);

  },

  async down (queryInterface, Sequelize) {   
  }
};
