module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('devices', 'category_id', {
      type: Sequelize.STRING,
      defaultValue: '0',
      allowNull: false,
    });
    await queryInterface.addColumn('devices', 'coordinator_device_id', {
      type: Sequelize.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'devices',
        key: 'id',
      },
    });
    await queryInterface.removeColumn('devices', 'timezone');
    await queryInterface.removeColumn('devices', 'time_format');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('devices', 'category_id');
    await queryInterface.removeColumn('devices', 'coordinator_device_id');
  },
};
