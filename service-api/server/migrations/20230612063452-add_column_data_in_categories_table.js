module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('categories', 'data', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('categories', 'data');
  },
};
