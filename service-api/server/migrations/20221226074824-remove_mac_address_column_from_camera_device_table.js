module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('camera_devices', 'mac_address');
  },

  down: async (queryInterface) => {
    await queryInterface.addColumn('camera_devices', 'mac_address');
  },
};