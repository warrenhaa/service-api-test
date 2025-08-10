module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('activity_logs', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUID,
      primaryKey: true,
    },
    entity: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    event_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    data: {
      type: Sequelize.JSONB,
    },
    notes: {
      type: Sequelize.STRING,
    },
    event_time: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    entity_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    client_id: {
      type: Sequelize.UUID,
    },
    request_id: {
      type: Sequelize.UUID,
    },
    source_ip: {
      type: Sequelize.STRING,
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
  down: (queryInterface) => queryInterface.dropTable('activity_logs'),
};
