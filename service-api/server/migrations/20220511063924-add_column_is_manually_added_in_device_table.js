module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('devices', 'is_manually_added', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('devices', 'is_manually_added');
  },
};
