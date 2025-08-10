module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('occupants_locations', 'company_id', {
      type: Sequelize.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'companies',
        key: 'id',
      },
    }),
  ]),

  down: (queryInterface) => {
    queryInterface.removeColumn('occupants_locations', 'company_id');
  },
};
