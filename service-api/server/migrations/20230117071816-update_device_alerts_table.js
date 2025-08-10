module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('device_alerts', 'device_id', {
      allowNull: true,
      type: Sequelize.UUID,
    });
    await queryInterface.addColumn('device_alerts', 'camera_device_id', {
      type: Sequelize.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'camera_devices',
        key: 'id',
      },
    });
  },

  down: async (queryInterface) => {
  },
};
