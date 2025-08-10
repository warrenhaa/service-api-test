module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('devices', 'coordinator_device_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('devices', 'coordinator_device_id');
  },
};
