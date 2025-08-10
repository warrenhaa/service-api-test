module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('jobs', 'meta_data', {
      type: Sequelize.JSONB,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('jobs', 'meta_data');
  },
};
