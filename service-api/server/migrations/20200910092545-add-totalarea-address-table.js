module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'addresses',
    'total_area',
    Sequelize.DECIMAL,
  ),

  down: (queryInterface) => queryInterface.removeColumn(
    'addresses',
    'total_area',
  ),
};
