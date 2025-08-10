module.exports = {
  up: (queryInterface) => queryInterface.addIndex('activity_logs', ['entity'])
    .then(() => queryInterface.addIndex('activity_logs', ['event_name']))
    .then(() => queryInterface.addIndex('activity_logs', ['user_id']))
    .then(() => queryInterface.addIndex('activity_logs', ['entity_id']))
    .then(() => queryInterface.addIndex('activity_logs', ['occupant_id'])),

  down: (queryInterface) => queryInterface.removeIndex('activity_logs', ['entity'])
    .then(() => queryInterface.removeIndex('activity_logs', ['event_name']))
    .then(() => queryInterface.removeIndex('activity_logs', ['user_id']))
    .then(() => queryInterface.removeIndex('activity_logs', ['entity_id']))
    .then(() => queryInterface.removeIndex('activity_logs', ['occupant_id'])),
};
