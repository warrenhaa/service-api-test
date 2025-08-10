module.exports = {
  up: async (queryInterface) => {
    await queryInterface.dropTable('activity_configs');
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('activity_configs');
  },
};
