module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeConstraint('devices', 'devices_device_code_key');
    await queryInterface.addConstraint('devices', ['device_code', 'company_id'],
      { type: 'unique', name: 'device_code_company_id_unique_key' });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('devices'); },
};
