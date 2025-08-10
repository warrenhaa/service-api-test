module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('devices', 'datapoints', {
      type: Sequelize.JSONB,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('devices', 'datapoints');
  },
};
