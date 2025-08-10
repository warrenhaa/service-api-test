module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('device_alerts', ['alert_type']);
    await queryInterface.addIndex('device_alerts', ['alert_code']);
    await queryInterface.addIndex('device_alerts', ['severity']);
    await queryInterface.addIndex('device_alerts', ['device_id', 'alert_code']);
    await queryInterface.addIndex('device_alerts', ['device_id', 'alert_type']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('device_alerts', ['alert_type']);
    await queryInterface.removeIndex('device_alerts', ['alert_code']);
    await queryInterface.removeIndex('device_alerts', ['severity']);
    await queryInterface.removeIndex('device_alerts', ['device_id', 'alert_code']);
    await queryInterface.removeIndex('device_alerts', ['device_id', 'alert_type']);
  },
};
