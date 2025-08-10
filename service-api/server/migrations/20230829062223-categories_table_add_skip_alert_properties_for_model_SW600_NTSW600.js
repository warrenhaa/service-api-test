module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update categories set data = '{"skip_alert_properties":["ErrorIASZSAlarmed1","ErrorIASZSTampered"]}' 
    where model =ANY (ARRAY['SW600','NTSW600']);
    `);
  },
  down: async (queryInterface, Sequelize) => {
  },
};
