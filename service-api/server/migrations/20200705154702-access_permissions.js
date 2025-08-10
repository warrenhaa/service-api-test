module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('access_permissions', {
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
    permissions: {
      type: Sequelize.JSONB,
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
    created_by: {
      type: Sequelize.STRING,
    },
    updated_by: {
      type: Sequelize.STRING,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('access-permissions'),
};
