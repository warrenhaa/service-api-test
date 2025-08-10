module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('devices', 'rule_group_id', {
      type: Sequelize.UUID,
      references: {
        model: 'rule_groups',
        key: 'id',
      },
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('devices', 'rule_group_id');
  },
};
