module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('access_permissions', 'company_id', {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      onDelete: 'CASCADE',
      references: {
        model: 'companies',
        key: 'id',
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('access_permissions', 'company_id');
  },
};
