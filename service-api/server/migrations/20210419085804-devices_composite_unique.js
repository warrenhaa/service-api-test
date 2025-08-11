module.exports = {
  up: async (queryInterface) => {
    try {
      
    await queryInterface.removeConstraint('devices', 'devices_device_code_key');
    } catch (error) {
      
    }
    await queryInterface.addConstraint('devices',
      { fields: ['device_code', 'company_id'],type: 'unique', name: 'device_code_company_id_unique_key' });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('devices'); },
};
