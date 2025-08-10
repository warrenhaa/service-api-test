module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('occupants_permissions', 'welcome_tile_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('occupants_permissions', 'welcome_tile_enabled');
  },
};
