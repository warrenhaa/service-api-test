module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('occupants', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
    queryInterface.addColumn('occupants', 'phone_number', {
      type: Sequelize.TEXT,
      allowNull: true,
    }),
  ]),

  down: (queryInterface) => {
    queryInterface.removeColumn('occupants', 'name');
    queryInterface.removeColumn('occupants', 'phone_number');
  },
};
