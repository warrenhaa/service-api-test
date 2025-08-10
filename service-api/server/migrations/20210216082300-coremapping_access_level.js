module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'core_permissions_mappings',
    'access_levels',
    Sequelize.ARRAY(Sequelize.TEXT),
  ),

  down: (queryInterface) => queryInterface.removeColumn(
    'core_permissions_mappings',
    'access_levels',
  ),
};
