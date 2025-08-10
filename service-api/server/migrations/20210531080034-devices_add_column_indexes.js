module.exports = {
  up: async (queryInterface) => queryInterface.addIndex('devices', ['location_id'])
    .then(() => queryInterface.addIndex('devices', ['type']))
    .then(() => queryInterface.addIndex('devices', ['gateway_id'])),

  down: async (queryInterface) => {
    queryInterface.dropTable('devices');
  },
};
