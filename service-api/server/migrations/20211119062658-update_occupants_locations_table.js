module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('occupants_locations', 'occupant_invite_id', {
      type: Sequelize.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'occupants_invitations',
        key: 'id',
      },
    });
    await queryInterface.removeColumn('occupants_locations', 'check_in_by');
    await queryInterface.addColumn('occupants_locations', 'check_in_by', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.removeColumn('occupants_locations', 'check_out_by');
    await queryInterface.addColumn('occupants_locations', 'check_out_by', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('occupants_locations', 'occupant_invite_id');
    await queryInterface.removeColumn('occupants_locations', 'check_in_by');
    await queryInterface.removeColumn('occupants_locations', 'check_out_by');
  },
};
