module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.removeIndex('device_events', 'device_events_property_name_event_at');
    queryInterface.addIndex('device_events', ['property_name', 'event_at']);
  },

  down: async () => {
  },
};
