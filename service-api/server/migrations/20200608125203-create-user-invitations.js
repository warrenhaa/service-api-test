module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('user_invitations', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    created_by: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    updated_by: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    expires_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    company_id: {
      type: Sequelize.UUID,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('user_invitations'),
};
