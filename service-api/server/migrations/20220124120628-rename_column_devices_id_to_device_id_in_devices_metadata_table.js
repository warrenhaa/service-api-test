module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameColumn('devices_metadata', 'devices_id', 'device_id');
  },

  down: async (queryInterface) => {
    await queryInterface.renameColumn('devices_metadata', 'devices_id', 'device_id');
  },
};
