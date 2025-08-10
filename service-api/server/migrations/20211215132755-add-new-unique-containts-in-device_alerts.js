module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('device_alerts', 'alert_type_device_id_unique');
    await queryInterface.addConstraint('device_alerts', ['alert_code', 'device_id'], { type: 'unique', name: 'alert_code_device_id_unique' });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('device_alerts', 'alert_code_device_id_unique');
  },
};
