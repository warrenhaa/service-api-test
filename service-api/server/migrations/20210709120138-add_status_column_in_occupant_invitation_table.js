module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('occupants_invitations', 'status', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
  ]),

  down: (queryInterface) => {
    queryInterface.removeColumn('occupants_invitations', 'status');
  },
};
