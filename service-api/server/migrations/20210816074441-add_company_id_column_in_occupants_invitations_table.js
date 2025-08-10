module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('occupants_invitations', 'company_id', {
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
    queryInterface.removeColumn('occupants_invitations', 'company_id');
  },
};
