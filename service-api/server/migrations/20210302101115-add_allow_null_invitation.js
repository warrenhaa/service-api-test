module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('user_invitations', 'expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('user_invitations', 'expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
};
