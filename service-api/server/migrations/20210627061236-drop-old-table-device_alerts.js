module.exports = {
  up: async (queryInterface) => {
    await queryInterface.dropTable('device_alerts');
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('device_alerts');
  },
};
