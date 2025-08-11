module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.sequelize.query('delete from device_alerts'),
    queryInterface.addConstraint('device_alerts',  { fields:['alert_type', 'device_id'], type: 'unique', name: 'alert_type_device_id_unique' }),
  ]),
  down: (queryInterface) => { queryInterface.removeConstraint('device_alerts', 'alert_type_device_id_unique'); },
};
