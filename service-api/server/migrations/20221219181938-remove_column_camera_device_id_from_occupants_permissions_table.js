module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('occupants_permissions', 'camera_device_id');
  },

  down: async (queryInterface) => {
    await queryInterface.addColumn('occupants_permissions', 'camera_device_id');
  },
};
