module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('template_contents', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    event_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    language: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email_config: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    sms_config: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    notification_config: {
      type: Sequelize.JSONB,
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
  }),
  down: (queryInterface) => queryInterface.dropTable('template_contents'),
};
