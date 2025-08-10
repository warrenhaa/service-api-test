module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      update template_contents set notification_config = '{
      "body": "Dear customer, Your Gateway has been successfully reset and deleted from your account.",
      "title": "Gateway Unregistered"}' 
       where key = 'GatewayUnregistered';
      `);
  },

  down: async (queryInterface, Sequelize) => {
  },
};