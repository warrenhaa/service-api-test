module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('device_alerts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      device_code: {
        type: Sequelize.STRING,
      },
      alert_msg: {
        type: Sequelize.STRING,
      },
      value: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      device_id: {
        type: Sequelize.UUID,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: 'devices',
          key: 'id',
        },
      },
      location_id: {
        type: Sequelize.UUID,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: 'locations',
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
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('device_alerts');
  },
};
