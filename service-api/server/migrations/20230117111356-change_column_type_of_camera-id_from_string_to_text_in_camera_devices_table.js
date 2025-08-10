module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.changeColumn('camera_devices', 'camera_id', {
      type: Sequelize.TEXT,
      allowNull: false,
    }),
  ]),

  down: (queryInterface) => {
    queryInterface.changeColumn('camera_devices', 'camera_id', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
