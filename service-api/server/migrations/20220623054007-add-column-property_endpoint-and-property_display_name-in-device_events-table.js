module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('device_events', 'property_endpoint', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('device_events', 'property_display_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('device_events', 'property_endpoint');
    await queryInterface.removeColumn('device_events', 'property_display_name');
  },
};
