module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('devices', 'plan_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('camera_devices', 'plan_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('devices', 'plan_code');
    await queryInterface.removeColumn('camera_devices', 'plan_code');
  },
};
