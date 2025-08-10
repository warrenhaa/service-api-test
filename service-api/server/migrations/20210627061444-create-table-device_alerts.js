module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('device_alerts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      alert_type: {
        type: Sequelize.STRING,
      },
      alert_msg: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      device: {
        type: Sequelize.JSONB,
        allowNull: true,
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
      gateway: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      location: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      severity: {
        type: Sequelize.STRING,
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

  down: async (queryInterface) => {
    await queryInterface.dropTable('device_alerts');
  },
};
