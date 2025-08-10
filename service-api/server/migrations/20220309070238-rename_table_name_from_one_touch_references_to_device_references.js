module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameTable('one_touch_references', 'device_references');
    await queryInterface.renameColumn('device_references', 'gateway_id', 'device_id');
  },

  down: async (queryInterface) => {
    await queryInterface.renameTable('one_touch_references', 'device_references');
    await queryInterface.renameColumn('device_references', 'device_id', 'gateway_id');
  },
};
