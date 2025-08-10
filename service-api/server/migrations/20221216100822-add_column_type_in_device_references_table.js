module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('device_references', 'type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('device_references', 'type');
  },
};
