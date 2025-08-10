module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('occupants_notification_tokens', 'data', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('occupants_notification_tokens', 'data');
  },
};