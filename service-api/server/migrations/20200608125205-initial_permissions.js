module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'user_invitations',
    'initial_permissions',
    Sequelize.JSONB,
  ),

  down: (queryInterface) => queryInterface.removeColumn(
    'user_invitations',
    'initial_permissions',
  ),
};
