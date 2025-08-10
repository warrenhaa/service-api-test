module.exports = {
  up: async (queryInterface) => {
    await queryInterface.dropTable('alert_types');
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('alert_types');
  },
};
