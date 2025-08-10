module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('users', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    cognito_id: {
      type: Sequelize.STRING,
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
    company_id: Sequelize.UUID,
    invite_id: {
      type: Sequelize.UUID,
      unique: true,
      allowNull: false,
      references: {
        model: 'user_invitations',
        key: 'id',
      },
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('users'),
};
