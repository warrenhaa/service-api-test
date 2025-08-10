module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'devices',
    'status',
    Sequelize.STRING,
  ),

  down: (queryInterface) => queryInterface.removeColumn(
    'devices',
    'status',
  ),
};
