'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  
   //signup.omnie EN
 await queryInterface.sequelize.query(`
 delete from template_contents where key ='SignUp.omnie' and language = 'en';
 INSERT INTO public.template_contents(   
    id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
    VALUES ('99515f96-1ed4-4177-bdf0-b62598234afe', 'SignUp.omnie', 'en', '{
     "body": "<p> Welcome to OMNIE Home. Please activate your account by copying the code below into your mobile app.</p> <p align = \\"center\\"> <b>{{OTP}}</b> </p> <p> You have 24 hours to activate your account. Once your account is activated, we will walk you through the setup process.</p> <p>Thank you</p>",
     "banner": "Welcome {{username}}!",
     "subject": "Please Confirm Your {{email_subject}} Account"
   }', '{
    "body": "<p> Welcome to OMNIE Home. Please activate your account by copying the code below into your mobile app.</p> <p align = \\"center\\"> <b>{{OTP}}</b> </p> <p> You have 24 hours to activate your account. Once your account is activated, we will walk you through the setup process.</p> <p>Thank you</p>"
  }', '{
    "body": "<p> Welcome to OMNIE Home. Please activate your account by copying the code below into your mobile app.</p> <p align = \\"center\\"> <b>{{OTP}}</b> </p> <p> You have 24 hours to activate your account. Once your account is activated, we will walk you through the setup process.</p> <p>Thank you</p>",
    "subject": "Please Confirm Your {{email_subject}} Account"
 }','2022-12-16 08:33:28.35+00', '2022-12-16 08:33:28.35+00', 'signup');
  `);

  },

  async down (queryInterface, Sequelize) {   
  }
};
