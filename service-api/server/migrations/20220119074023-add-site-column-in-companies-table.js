module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'site', {
      type: Sequelize.JSONB,
      defaultValue: {},
      allowNull: false,
    });
    await queryInterface.removeColumn('companies', 'site_id');
    await queryInterface.removeColumn('companies', 'contact_url');
    await queryInterface.removeColumn('companies', 'website_url');
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('companies', 'site');
  },
};
