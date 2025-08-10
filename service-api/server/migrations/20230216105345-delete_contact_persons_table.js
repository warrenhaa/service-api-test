module.exports = {
  up: async (queryInterface) => {
    await queryInterface.dropTable('contact_persons');
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('contact_persons');
  },
};