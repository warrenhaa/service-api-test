module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(`
   delete from template_contents where key ='AlertSMSExceeded' and language = 'en';
   INSERT INTO public.template_contents(   
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('e350f54e-63cb-453a-8142-76ae87e961fe', 'AlertSMSExceeded', 'en', 'null', '{
      "body": "Daily alert text message limit is exceeded for device alerts, you will receive next device alert tomorrow (if any)"
    }', 'null','2024-03-13 01:39:02.913+05:30', '2024-03-13 01:39:02.913+05:30', 'alert');
    `);

        await queryInterface.sequelize.query(`
   delete from template_contents where key ='OneTouchSMSExceeded' and language = 'en';
   INSERT INTO public.template_contents(   
      id, key, language, email_config, sms_config, notification_config, created_at, updated_at, type)
      VALUES ('ff9b55fb-54f3-4efd-ab65-e0c90be76166', 'OneTouchSMSExceeded', 'en', 'null', '{
      "body":"Daily alert text message limit is exceeded for OneTouch alerts, you will receive next OneTouch alert tomorrow (if any)"
    }', 'null','2024-03-13 01:39:02.913+05:30', '2024-03-13 01:39:02.913+05:30', 'onetouch');
    `);
    },

};