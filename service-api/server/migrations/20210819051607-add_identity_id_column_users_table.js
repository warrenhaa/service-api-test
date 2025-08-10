module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('users', 'identity_id', {
      type: Sequelize.TEXT,
      allowNull: true,
    }),
  ]),

  down: (queryInterface) => {
    queryInterface.removeColumn('users', 'identity_id');
  },
};
