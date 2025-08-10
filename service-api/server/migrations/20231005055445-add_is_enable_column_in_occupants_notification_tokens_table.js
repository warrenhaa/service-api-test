module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('occupants_notification_tokens', 'is_enable', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('occupants_notification_tokens', 'is_enable');
  },
};