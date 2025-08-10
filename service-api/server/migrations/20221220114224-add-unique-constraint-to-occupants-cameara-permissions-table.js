module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('occupants_camera_permissions', ['occupant_permission_id', 'camera_device_id'],
      { type: 'unique', name: 'occupant_permission_id_camera_device_id_unique_key' });
  },
  down: async (queryInterface) => {
    await queryInterface.removeConstraint('occupants_camera_permissions', 'occupant_permission_id_camera_device_id_unique_key');
     },
};
