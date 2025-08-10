module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('one_touch_rules', 'one_touch_rules_rule_trigger_key_key');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('one_touch_rules', 'one_touch_rules_rule_trigger_key_key');
  }
};
