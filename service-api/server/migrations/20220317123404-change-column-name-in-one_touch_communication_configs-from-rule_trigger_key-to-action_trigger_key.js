module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameColumn('one_touch_communication_configs', 'rule_trigger_key', 'action_trigger_key');
  },

  down: async (queryInterface) => {
    await queryInterface.renameColumn('one_touch_communication_configs', 'action_trigger_key', 'rule_trigger_key');
  },
};
