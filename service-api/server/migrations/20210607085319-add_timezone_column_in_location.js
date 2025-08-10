module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('locations', 'timezone', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
  ]),

  down: (queryInterface) => {
    queryInterface.removeColumn('locations', 'timezone');
  },
};
