module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('device_alerts', 'device_status_histories');
    await queryInterface.renameTable('device_alert_histories', 'device_status_actions');
    await queryInterface.createTable('device_alerts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      alert_type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      alert_code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      severity: {
        allowNull: false,
        type: Sequelize.STRING,
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
      device_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'devices',
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
    await queryInterface.renameTable('device_status_histories', 'device_alerts');
    await queryInterface.renameTable('device_status_actions', 'device_alert_histories');
    await queryInterface.dropTable('device_alerts');
  },
};
