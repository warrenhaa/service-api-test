module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      update categories set data = '{"skip_alert_properties":["ErrorIASZSLowBattery"]}' where model = 'CSB600';
      `);
  },
  down: async (queryInterface, Sequelize) => {
  },
};