module.exports = {
  up: async (queryInterface) => queryInterface.addIndex('locations_permissions', ['location_id']),
  down: async (queryInterface) => queryInterface.dropTable('locations_permissions'),
};
