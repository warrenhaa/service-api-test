module.exports = {
  up: async (queryInterface, Sequelize) => {
  
    await queryInterface.addColumn('camera_devices', 'occupant_id', {
      type: Sequelize.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'occupants',
        key: 'id',
      },
    });
    await queryInterface.addColumn('camera_devices', 'gateway_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.addColumn('camera_devices', 'type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('camera_devices', 'occupant_id'); 
    await queryInterface.removeColumn('camera_devices', 'gateway_id');
    await queryInterface.removeColumn('camera_devices', 'type');
 
  },
};
