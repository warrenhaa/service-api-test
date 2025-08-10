module.exports = {
  up: async (queryInterface) => {
    await queryInterface.dropTable('company_verifications');
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('company_verifications');
  },
};
