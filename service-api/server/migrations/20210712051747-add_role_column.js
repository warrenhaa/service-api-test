module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('locations_permissions',
      'role',
      {
        type: Sequelize.STRING,
      });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('locations_permissions');
  },
};
