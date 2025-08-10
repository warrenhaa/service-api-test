module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('rule_groups', 'key', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('rule_groups', 'key');
  },
};
