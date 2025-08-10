module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('activity_logs', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('activity_logs', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },
};
