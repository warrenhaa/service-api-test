module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('user_preferences', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      unique: true,
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
    time_format: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    date_format: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    temperature_format: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    timezone_format: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    country: {
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
  }),
  down: (queryInterface) => queryInterface.dropTable('user_preferences'),
};
