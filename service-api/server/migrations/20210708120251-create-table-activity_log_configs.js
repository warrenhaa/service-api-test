module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('activity_log_configs', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    event_name: {
      type: Sequelize.STRING,
      allowNull: false,
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
    placeholders: {
      allowNull: true,
      type: Sequelize.JSONB,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('activity_log_configs'),
};
