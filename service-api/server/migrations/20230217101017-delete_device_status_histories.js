module.exports = {
  up: async (queryInterface) => {
    await queryInterface.dropTable('device_status_histories');
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('device_status_histories');
  },
};
