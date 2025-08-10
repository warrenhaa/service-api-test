module.exports = {
  up: async (queryInterface) => {
 //// alert trigger dynamic body //////
 
     // alert BG
     await queryInterface.sequelize.query(`
     delete from template_contents where key ='Alert' and language = 'bg';
     INSERT INTO public.template_contents(   
        id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
        VALUES ('d304a1d7-36e6-4b19-93ab-2db910baf466', 'Alert', 'bg', '{
          "banner": "Здравей {{user_name}}",
          "body": "{{message}}",
          "subject": "{{message}}"
          }', '{
            "body": "{{message}}"
     }', '{
      "body": "{{message}}",
      "subject": "{{message}}"
     }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
      `);
     
   // alert CS
   await queryInterface.sequelize.query(`
   delete from template_contents where key ='Alert' and language = 'cs';
   INSERT INTO public.template_contents(   
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('15c5338c-b794-46a7-ac0f-ce2358ac4003', 'Alert', 'cs', '{
        "banner": "Ahoj {{user_name}}",
        "body": "{{message}}",
        "subject": "{{message}}"
        }', '{
          "body": "{{message}}"
   }', '{
    "body": "{{message}}",
    "subject": "{{message}}"
   }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
    `);
  
  // alert DA
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'da';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('3b112c9e-3ef2-4d53-98ed-b280897e81c6', 'Alert', 'da', '{
       "banner": "Hej {{user_name}}",
       "body": "{{message}}",
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert DE
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'de';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('594bcc89-adee-44fb-8461-6c58abd55fc5', 'Alert', 'de', '{
       "banner": "Hallo {{user_name}}",
       "body": "{{message}}",
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert EL
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'el';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('84667d39-f259-44f8-a6df-2e97c2d34428', 'Alert', 'el', '{
       "banner": "Γειά σας {{user_name}}",
       "body": "{{message}}",
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert EN
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'en';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('e7d96116-9749-479c-9ff5-4f017a0afe70', 'Alert', 'en', '{
       "banner": "Hello {{user_name}}",
       "body": "{{message}}",
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert ES
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'es';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('37be02f4-cee4-4fbd-b5c1-19fd74773b57', 'Alert', 'es', '{
       "banner": "Hola {{user_name}}",
       "body": "{{message}}",  
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert ET
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'et';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('e1cb867a-8a99-40d8-84b9-138eca811883', 'Alert', 'et', '{
       "banner": "Tere, {{user_name}}",
       "body": "{{message}}", 
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
   // alert FI
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'fi';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('11b460af-d65b-4717-9cc8-e5cbcccb022f', 'Alert', 'fi', '{
       "banner": "Hei {{user_name}}",
       "body": "{{message}}",
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert FR
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'fr';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('97557c95-bc38-42be-b6b0-692a832591b2', 'Alert', 'fr', '{
       "banner": "Bonjour {{user_name}}",
       "body": "{{message}}", 
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert NL
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'nl';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('66a9adea-481f-4a8d-b02f-68a7c1b3ebb1', 'Alert', 'nl', '{
       "banner": "Hallo {{user_name}}",
       "body": "{{message}}",
       "subject": "{{message}}"  
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert NO
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'no';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('9161ec64-cdcd-48da-9924-98115c1696aa', 'Alert', 'no', '{
       "banner": "Hallo {{user_name}}",
       "body": "{{message}}", 
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert PL 
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'pl';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('22178f76-0dfa-42a4-a43f-1e45d95aa2b3', 'Alert', 'pl', '{
       "banner": "Witaj {{user_name}}",
       "body": "{{message}}", 
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert RO
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'ro';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('838b90b2-411e-4556-bb8b-3137ae9c2d42', 'Alert', 'ro', '{
       "banner": "Salut {{user_name}}",
       "body": "{{message}}",  
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert RU
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'ru';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('7165b99c-94f1-431c-9952-ae26bef80d01', 'Alert', 'ru', '{
       "banner": "Привет, {{user_name}}",
       "body": "{{message}}", 
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert SR
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'sr';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('967b87a4-2296-4bb8-b68d-91d8b92aad67', 'Alert', 'sr', '{
       "banner": "Zdravo {{user_name}}",
       "body": "{{message}}", 
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert SV
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'sv';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('f97395b6-40fd-464d-8a47-41160a28abbf', 'Alert', 'sv', '{
       "banner": "Hej {{user_name}}",
       "body": "{{message}}", 
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
   `);
  
  // alert UK
  await queryInterface.sequelize.query(`
  delete from template_contents where key ='Alert' and language = 'uk';
  INSERT INTO public.template_contents(   
     id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
     VALUES ('770e18e2-6da4-4bb6-ade9-de5435efcc44', 'Alert', 'uk', '{
       "banner": "Привіт, {{user_name}}",
       "body": "{{message}}",  
       "subject": "{{message}}"
       }', '{
         "body": "{{message}}"
  }', '{
   "body": "{{message}}",
   "subject": "{{message}}"
  }','2022-11-04 08:33:28.35+00', '2022-11-04 08:33:28.35+00', 'alert');
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
       "body": "{{message}}"
}', '{
 "body": "{{message}}",
 "subject": "OneTouch rule was triggered"
}','2022-11-03 08:33:28.35+00', '2022-11-03 08:33:28.35+00', 'onetouch');
 `);
},
  down: async (queryInterface, Sequelize) => { },
};
