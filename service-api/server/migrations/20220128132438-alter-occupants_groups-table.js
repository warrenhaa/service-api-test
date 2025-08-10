module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('occupants_groups', 'gateway_id');
    await queryInterface.removeColumn('occupants_groups', 'occupant_location_id');
    await queryInterface.removeColumn('occupants_groups', 'pin');
    await queryInterface.removeColumn('occupants_groups', 'grid_order');
    await queryInterface.sequelize.query('delete from occupants_groups');
    await queryInterface.addColumn('occupants_groups', 'item_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    await queryInterface.addColumn('occupants_groups', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('occupants_groups', 'gateway_id');
    await queryInterface.removeColumn('occupants_groups', 'occupant_location_id');
  },
};
