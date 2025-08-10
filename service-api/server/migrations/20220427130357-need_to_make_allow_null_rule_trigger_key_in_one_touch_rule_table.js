module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('one_touch_rules', 'rule_trigger_key', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
  },
};
