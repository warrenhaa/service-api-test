module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.changeColumn('devices', 'status', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
  ]),

  down: (queryInterface, Sequelize) => Promise.all([
    queryInterface.changeColumn('devices', 'status', {
      type: Sequelize.JSONB,
      allowNull: true,
    }),
  ]),
};
