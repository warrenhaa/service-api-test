module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('occupants_notification_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      occupant_id: {
        allowNull: false,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'occupants',
          key: 'id',
        },
      },
      dnd: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
      os: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      token: {
        type: Sequelize.TEXT,
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
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('occupants_notification_tokens');
  },
};
