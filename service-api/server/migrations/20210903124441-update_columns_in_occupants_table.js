module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.changeColumn('occupants', 'company_id', {
      type: Sequelize.UUID,
      allowNull: false,
    }),
    queryInterface.changeColumn('occupants', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
    }),
    queryInterface.changeColumn('occupants', 'cognito_id', {
      type: Sequelize.STRING,
      allowNull: false,
    }),
    queryInterface.changeColumn('occupants', 'identity_id', {
      type: Sequelize.TEXT,
      allowNull: false,
    }),
  ]),

  down: (queryInterface) => Promise.all([
    queryInterface.removeColumn('occupants', 'company_id'),
    queryInterface.removeColumn('occupants', 'email'),
    queryInterface.removeColumn('occupants', 'cognito_id'),
    queryInterface.removeColumn('occupants', 'identity_id'),
  ]),
};
