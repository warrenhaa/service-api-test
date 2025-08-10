module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('occupants_camera_permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      access_level: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      occupant_permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'occupants_permissions',
          key: 'id',
        },
      },
      camera_device_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'camera_devices',
          key: 'id',
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('occupants_camera_permissions');
  },
};
