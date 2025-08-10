module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('occupants_dashboard_attributes', 'device_id');
    await queryInterface.removeColumn('occupants_dashboard_attributes', 'one_touch_rule_id');
    await queryInterface.removeColumn('occupants_dashboard_attributes', 'pin');
    await queryInterface.removeColumn('occupants_dashboard_attributes', 'is_grouped');
    await queryInterface.sequelize.query('delete from occupants_dashboard_attributes');
    await queryInterface.addColumn('occupants_dashboard_attributes', 'item_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    await queryInterface.addColumn('occupants_dashboard_attributes', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('occupants_dashboard_attributes', 'grid_order', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('occupants_dashboard_attributes', 'device_id');
    await queryInterface.removeColumn('occupants_dashboard_attributes', 'one_touch_rule_id');
    await queryInterface.removeColumn('occupants_dashboard_attributes', 'pin');
    await queryInterface.removeColumn('occupants_dashboard_attributes', 'is_grouped');
  },
};
