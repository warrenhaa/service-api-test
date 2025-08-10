module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      'delete from occupants_permissions',
    );
    await queryInterface.changeColumn('occupants_permissions', 'receiver_occupant_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.addColumn('occupants_permissions', 'invitation_email', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('occupants_permissions', 'receiver_occupant_id');
    await queryInterface.removeColumn('occupants_permissions', 'invitation_email');
  },
};
