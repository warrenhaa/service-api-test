module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      update categories set data = '{"skip_alert_properties":["ErrorIASZSAlarmed1", "ErrorIASZSTampered"]}' where model = 'OS600';
      `);
  },
  down: async (queryInterface, Sequelize) => {
  },
};