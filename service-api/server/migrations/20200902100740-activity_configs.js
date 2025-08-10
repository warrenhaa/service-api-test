module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('activity_configs', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUID,
      primaryKey: true,
    },
    entity: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    send_email: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    send_sms: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
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
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('activity_configs'),
};
