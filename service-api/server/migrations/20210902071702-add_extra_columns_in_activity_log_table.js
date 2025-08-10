module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('activity_logs', 'occupant_id', {
      type: Sequelize.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'occupants',
        key: 'id',
      },
    }),

  ]),

  down: (queryInterface) => Promise.all([
    queryInterface.removeColumn('activity_logs', 'occupant_id'),
  ]),
};
