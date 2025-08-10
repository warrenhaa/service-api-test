module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('devices', 'short_id', {
      type: Sequelize.INTEGER,
    }),
    queryInterface.addConstraint('devices', ['device_code', 'short_id'],
      { type: 'unique', name: 'devices_device_code_short_id_uk' }),
  ]),
  down: (queryInterface) => Promise.all([
    queryInterface.removeColumn('devices', 'short_id'),
    queryInterface.removeConstraint('devices', 'devices_device_code_short_id_uk'),
  ]),
};
