module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update activity_logs set event_name = 'EmailSent' where  event_name = 'EmailReceived'
    `);
    await queryInterface.sequelize.query(`
    update activity_logs set event_name = 'SMSSent' where  event_name = 'SMSReceived'
    `);
    await queryInterface.sequelize.query(`
    update activity_logs set event_name = 'NotificationSent' where  event_name = 'NotificationReceived'
    `);
  },

  down: async (queryInterface, Sequelize) => {
  },
};
