module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
    await queryInterface.removeColumn('one_touch_communication_config', 'gateway_id');
    await queryInterface.addColumn('one_touch_communication_config', 'one_touch_rule_id', {
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'one_touch_rules',
        key: 'id',
      },
    });
    } catch (error) {
      
    }
 
    await queryInterface.addConstraint('one_touch_communication_config',  {fields:['one_touch_rule_id'], type: 'unique', name: 'one_touch_rule_id-unique' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('one_touch_communication_config', 'one_touch_rule_id-unique');
    await queryInterface.addColumn('one_touch_communication_config', 'gateway_id', {
      allowNull: false,
      type: Sequelize.UUID,
    });
    await queryInterface.removeColumn('one_touch_communication_config', 'one_touch_rule_id');
  },
};
