module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('occupants_invitations', 'invited_by');
    await queryInterface.addColumn('occupants_invitations', 'invited_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('occupants_invitations', 'invited_by');
  },
};
