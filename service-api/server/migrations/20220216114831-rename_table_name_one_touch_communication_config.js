module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameTable('one_touch_communication_config', 'one_touch_communication_configs');
  },

  down: async (queryInterface) => {
    await queryInterface.renameTable('one_touch_communication_configs', 'one_touch_communication_configs');
  },
};
