module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('jobs', 'request_id', {
    type: Sequelize.UUID,
    allowNull: true,
  }),

  down: (queryInterface) => {
    queryInterface.removeColumn('jobs', 'request_id');
  },
};
