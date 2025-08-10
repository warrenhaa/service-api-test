module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('alert_communication_configs', 'alert_message', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('alert_communication_configs', 'alert_message', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  }
};
