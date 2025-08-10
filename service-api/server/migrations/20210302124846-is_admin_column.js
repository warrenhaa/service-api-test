module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('users', 'isAdmin', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    }),
  ]),

  down: (queryInterface) => {
    queryInterface.removeColumn('users', 'isAdmin');
  },
};
