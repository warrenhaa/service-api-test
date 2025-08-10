module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('device_references', 'data', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('device_references', 'data');
  },
};
