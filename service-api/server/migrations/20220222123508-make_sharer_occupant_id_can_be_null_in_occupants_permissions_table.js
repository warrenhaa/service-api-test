module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('occupants_permissions', 'sharer_occupant_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
  },
};
