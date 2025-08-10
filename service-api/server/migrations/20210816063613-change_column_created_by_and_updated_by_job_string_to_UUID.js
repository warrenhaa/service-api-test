module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.removeColumn('jobs', 'created_by'),
    queryInterface.addColumn('jobs', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
    }),
    queryInterface.removeColumn('jobs', 'updated_by'),
    queryInterface.addColumn('jobs', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
    }),

  ]),

  down: (queryInterface) => Promise.all([
    queryInterface.removeColumn('jobs', 'created_by'),
    queryInterface.removeColumn('jobs', 'updated_by'),
  ]),
};
