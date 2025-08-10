module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('occupants_permissions', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.changeColumn('occupants_permissions', 'sharer_occupant_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.changeColumn('occupants_permissions', 'is_temp_access', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('occupants_permissions', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.changeColumn('occupants_permissions', 'sharer_occupant_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },
};
