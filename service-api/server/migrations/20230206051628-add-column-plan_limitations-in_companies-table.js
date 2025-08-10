module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'plan_limitations', {
      type: Sequelize.JSONB,
      defaultValue: {},
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('companies', 'plan_limitations');
  },
};
