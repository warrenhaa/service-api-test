module.exports = {
  up: async (queryInterface) => {
    await queryInterface.dropTable('device_status_actions');
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('device_status_actions');
  },
};
