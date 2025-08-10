'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('occupants_permissions', 'camera_device_id', {
      type: Sequelize.UUID,
      references: {
        model: 'camera_devices',
        key: 'id',
      },
      allowNull: true,
    });

    await queryInterface.changeColumn('occupants_permissions', 'gateway_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
  }
};
