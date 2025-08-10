module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('devices', 'latlong', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    queryInterface.removeColumn('devices', 'latlong');
  },
};
