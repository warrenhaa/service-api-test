module.exports = {
  up: async (queryInterface) => {
///// one touch trigger/////
    // one touch BG
    await queryInterface.sequelize.query(`
    delete from template_contents where key ='OneTouch' and language = 'bg';
   INSERT INTO public.template_contents(   
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('704c5b9e-00b0-4013-a775-4344b1961226', 'OneTouch', 'bg', '{
        "banner": "Здравей {{user_name}}",
        "body": "{{message}}",
        "subject": "OneTouch правило се задейства"
        }', '{
          "body": "{{message}}"
   }', '{
    "body": "{{message}}",
    "subject": "OneTouch правило се задейства"
   }','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
    `);
   
 // one touch CS
 await queryInterface.sequelize.query(`
 delete from template_contents where key ='OneTouch' and language = 'cs';
 INSERT INTO public.template_contents(   
    id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
    VALUES ('5e3929f8-5933-4bf1-8839-ada5e4be86ed', 'OneTouch', 'cs', '{
      "banner": "Ahoj {{user_name}}",
      "body": "{{message}}",
      "subject": "OneTouch pravidlo bylo spuštěno"
      }', '{
        "body": "{{message}}"
 }', '{
  "body": "{{message}}",
  "subject": "OneTouch pravidlo bylo spuštěno"
 }','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
  `);

// one touch DA
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'da';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('cd4783fe-67ed-4306-96a0-87ddd94a7ff5', 'OneTouch', 'da', '{
     "banner": "Hej {{user_name}}",
     "body": "{{message}}",
     "subject": "OneTouch regel blev udløst"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "OneTouch regel blev udløst"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch DE
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'de';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('b13819d2-d415-4cdb-abdb-5b02783f4b35', 'OneTouch', 'de', '{
     "banner": "Hallo {{user_name}}",
     "body": "{{message}}",
     "subject": "OneTouch-Regel wurde aktiviert"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "OneTouch-Regel wurde aktiviert"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch EL
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'el';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('8bb25a12-317a-475d-b917-61fb81bab132', 'OneTouch', 'el', '{
     "banner": "Γειά σας {{user_name}}",
     "body": "{{message}}",
     "subject": "Ο έλεγχος OneTouch ενεργοποιήθηκε"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "Ο έλεγχος OneTouch ενεργοποιήθηκε"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch EN
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'en';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('bc7187a3-6ba3-4f77-b53f-39356684e079', 'OneTouch', 'en', '{
     "banner": "Hello {{user_name}}",
     "body": "{{message}}",
     "subject": "OneTouch rule was triggered"
     }', '{
       "body": "{{message}} {{update_time}}"
}', '{
 "body": "{{message}} {{update_time}}",
 "subject": "OneTouch rule was triggered"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch ES
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'es';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('2f81aaba-eefa-4fd2-ac9c-d060cd29ca0b', 'OneTouch', 'es', '{
     "banner": "Hola {{user_name}}",
     "body": "{{message}}",  
     "subject": "La regla OneTouch se activó"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "La regla OneTouch se activó"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch ET
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'et';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('91e0477b-2002-4207-b229-0822edc3f047', 'OneTouch', 'et', '{
     "banner": "Tere, {{user_name}}",
     "body": "{{message}}", 
     "subject": "OneTouch reegel rakendus"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "OneTouch reegel rakendus"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

 // one touch FI
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'fi';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('ac8a61db-16cd-47b7-be05-c24419e6bf01', 'OneTouch', 'fi', '{
     "banner": "Hei {{user_name}}",
     "body": "{{message}}",
     "subject": "OneTouch-sääntö laukaistiin"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "OneTouch-sääntö laukaistiin"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch FR
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'fr';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('d8cd98ad-d1c1-4e02-806a-573bbc7fe9d8', 'OneTouch', 'fr', '{
     "banner": "Bonjour {{user_name}}",
     "body": "{{message}}", 
     "subject": "La règle OneTouch a été activée"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "La règle OneTouch a été activée"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch NL
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'nl';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('d5f3fbd6-9815-406d-ba6d-9994e3a0b5a4', 'OneTouch', 'nl', '{
     "banner": "Hallo {{user_name}}",
     "body": "{{message}}",
     "subject": "OneTouch-regel werd getriggerd"  
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "OneTouch-regel werd getriggerd"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch NO
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'no';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('fd431669-9624-412c-adb0-2dcb442ddc6b', 'OneTouch', 'no', '{
     "banner": "Hallo {{user_name}}",
     "body": "{{message}}", 
     "subject": "Onetouch-regel ble utløst"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "Onetouch-regel ble utløst"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch PL 
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'pl';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('7aec0a35-7088-4e6c-8b28-48b2a4b0e46f', 'OneTouch', 'pl', '{
     "banner": "Witaj {{user_name}}",
     "body": "{{message}}", 
     "subject": "Uruchomiono regułę OneTouch "
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "Uruchomiono regułę OneTouch "
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch RO
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'ro';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('8480cbf1-0a4f-4c93-a1ed-938f584ece0d', 'OneTouch', 'ro', '{
     "banner": "Salut {{user_name}}",
     "body": "{{message}}",  
     "subject": "Regula OneTouch a fost  activată"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "Regula OneTouch a fost  activată"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch RU
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'ru';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('4670a3a4-a44e-4114-982a-f46c4a389623', 'OneTouch', 'ru', '{
     "banner": "Привет, {{user_name}}",
     "body": "{{message}}", 
     "subject": "Был активирован алгоритм работы правила OneTouch"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "Был активирован алгоритм работы правила OneTouch"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch SR
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'sr';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('3a6ffd1c-8413-4f96-82ef-7435fc741b51', 'OneTouch', 'sr', '{
     "banner": "Zdravo {{user_name}}",
     "body": "{{message}}", 
     "subject": "Pravilo Jedan Klik je pokrenuto"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "Pravilo Jedan Klik je pokrenuto"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch SV
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'sv';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('cbd73350-f9e6-40ef-9441-f5c536be304b', 'OneTouch', 'sv', '{
     "banner": "Hej {{user_name}}",
     "body": "{{message}}", 
     "subject": "OneTouch-regel triggades"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "OneTouch-regel triggades"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);

// one touch UK
await queryInterface.sequelize.query(`
delete from template_contents where key ='OneTouch' and language = 'uk';
INSERT INTO public.template_contents(   
   id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
   VALUES ('86df8c5f-d02e-4e9c-b450-6b4d10c9343f', 'OneTouch', 'uk', '{
     "banner": "Привіт, {{user_name}}",
     "body": "{{message}}",  
     "subject": "Був активований алгоритм роботи системи OneTouch"
     }', '{
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "Був активований алгоритм роботи системи OneTouch"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);
},
  down: async (queryInterface, Sequelize) => { },
};
