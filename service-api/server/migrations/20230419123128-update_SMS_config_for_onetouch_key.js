module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      update template_contents set sms_config = '{
    "body": "{{{message}}}"}' 
       where key = 'OneTouch';
      `);
  },
  down: async (queryInterface, Sequelize) => {
  },
};