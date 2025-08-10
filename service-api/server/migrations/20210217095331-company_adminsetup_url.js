module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'companies',
    'admin_setup_url',
    Sequelize.TEXT,
  ),

  down: (queryInterface) => queryInterface.removeColumn(
    'companies',
    'admin_setup_url',
  ),
};
