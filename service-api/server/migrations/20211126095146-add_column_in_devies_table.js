module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('devices', 'timezone', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
    queryInterface.addColumn('devices', 'time_format', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    }),
  ]),

  down: (queryInterface) => Promise.all([
    queryInterface.removeColumn('devices', 'timezone'),
    queryInterface.removeColumn('devices', 'time_format'),
  ]),
};
