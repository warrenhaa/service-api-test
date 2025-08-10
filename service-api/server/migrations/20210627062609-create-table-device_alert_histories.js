module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('device_alert_histories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      status: {
        type: Sequelize.STRING,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      device_alert_id: {
        type: Sequelize.UUID,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: 'device_alerts',
          key: 'id',
        },
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: 'companies',
          key: 'id',
        },
      },
      entity: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      entity_value: {
        type: Sequelize.TEXT,
        allowNull: true,
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('device_alert_histories');
  },
};
