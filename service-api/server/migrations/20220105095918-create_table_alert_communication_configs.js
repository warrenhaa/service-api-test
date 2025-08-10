module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('alert_communication_configs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      alert_type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      alert_message: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      occupant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'occupants',
          key: 'id',
        },
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
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
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'companies',
          key: 'id',
        },
      },
      email_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      sms_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      notification_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }).then(() => queryInterface.addIndex('alert_communication_configs', ['alert_type', 'email_enabled', 'sms_enabled', 'notification_enabled']));
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('alert_communication_configs');
  },
};
