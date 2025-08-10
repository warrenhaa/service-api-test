module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('activity_logs', 'placeholders_data', {
      type: Sequelize.JSONB,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('activity_logs', 'placeholders_data');
  },
};
