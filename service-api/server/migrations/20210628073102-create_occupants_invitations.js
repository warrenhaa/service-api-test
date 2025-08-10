module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('occupants_invitations', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    invite_code: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    invited_at: {
      allowNull: true,
      type: Sequelize.DATE,
    },
    invited_by: {
      type: Sequelize.STRING,
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
  down: (queryInterface) => queryInterface.dropTable('occupants_invitations'),
};
