module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('one_touch_communication_configs', 'rule_trigger_key-unique');
    await queryInterface.removeConstraint('one_touch_communication_configs', 'one_touch_rule_id-unique');
    await queryInterface.addConstraint('one_touch_communication_configs', ['action_trigger_key'], { type: 'unique', name: 'action_trigger_key-unique' });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('one_touch_communication_configs', 'action_trigger_key-unique');
  },
};
