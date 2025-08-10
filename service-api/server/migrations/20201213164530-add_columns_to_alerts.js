module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('device_alerts', 'status', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('device_alerts', 'severity', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('device_alerts', 'event_time', {
        type: Sequelize.DATE,
      }),
    ]);
  },

  down(queryInterface) {
    return Promise.all([
      queryInterface.removeColumn('device_alerts', 'status'),
      queryInterface.removeColumn('device_alerts', 'severity'),
      queryInterface.removeColumn('device_alerts', 'event_time'),
    ]);
  },
};
