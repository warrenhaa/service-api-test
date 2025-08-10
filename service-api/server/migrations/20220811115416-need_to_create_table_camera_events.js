module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('camera_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      property_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      property_value: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      camera_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'companies',
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
    await queryInterface.dropTable('camera_devices');
  },
};