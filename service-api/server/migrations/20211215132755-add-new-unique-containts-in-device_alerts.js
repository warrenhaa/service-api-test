module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
    await queryInterface.removeConstraint('device_alerts', 'alert_type_device_id_unique');
    } catch (error) {
      
    }
    await queryInterface.addConstraint('device_alerts',  {fields:['alert_code', 'device_id'], type: 'unique', name: 'alert_code_device_id_unique' });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('device_alerts', 'alert_code_device_id_unique');
  },
};
