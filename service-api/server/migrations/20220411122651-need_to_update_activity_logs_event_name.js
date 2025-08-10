module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query("update activity_logs set event_name='GDPRACCESS' where event_name ='GDPR_ACCESS'");
    await queryInterface.sequelize.query("update activity_logs set event_name='EmailReceived' where event_name ='email received'");
  },

  down: async () => {
  },
};
