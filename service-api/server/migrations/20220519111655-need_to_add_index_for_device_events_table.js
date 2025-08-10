module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addIndex('device_events', ['device_code', 'property_name', 'event_at']);
  },

  down: async () => {
  },
};
