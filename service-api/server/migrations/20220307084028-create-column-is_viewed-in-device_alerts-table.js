module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('device_alerts', 'is_viewed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('device_alerts', 'is_viewed');
  },
};
