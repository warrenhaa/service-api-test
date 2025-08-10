module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('occupants_dashboard_attributes', 'device_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.changeColumn('occupants_dashboard_attributes', 'one_touch_rule_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.addConstraint('occupants_dashboard_attributes', ['occupant_id', 'device_id', 'one_touch_rule_id', 'company_id'],
      { type: 'unique', name: 'added_occupants_dashboard_attributes_unique_constraints' });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('occupants_dashboard_attributes', 'device_id');
    await queryInterface.removeColumn('occupants_dashboard_attributes', 'one_touch_rule_id');
    await queryInterface.removeConstraint('occupants_dashboard_attributes', 'added_occupants_dashboard_attributes_unique_constraints');
  },
};
