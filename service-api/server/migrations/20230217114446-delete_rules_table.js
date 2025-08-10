module.exports = {
  up: async (queryInterface) => {
    await queryInterface.dropTable('rules');
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('rules');
  },
};
