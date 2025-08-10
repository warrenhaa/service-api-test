module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'locations',
    'path',
    Sequelize.JSONB,
  ),

  down: (queryInterface) => queryInterface.removeColumn(
    'locations',
    'path',
  ),
};
