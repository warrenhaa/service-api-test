module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'contact_url', {
      type: Sequelize.TEXT,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('companies', 'contact_url');
  },
};
