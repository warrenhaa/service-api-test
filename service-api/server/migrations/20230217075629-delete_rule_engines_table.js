module.exports = {
  up: async (queryInterface) => {
    await queryInterface.dropTable('rules_engines');
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('rules_engines');
  },
};
