module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('alert_types', 'company_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('alert_types', 'company_id');
  },
};
