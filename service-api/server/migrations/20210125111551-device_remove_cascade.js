module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeConstraint(
      'devices',
      'devices_location_id_fkey',
    );
    await queryInterface.addConstraint('devices', ['location_id'], {
      type: 'foreign key',
      name: 'devices_location_id_fkey',
      references: {
        table: 'locations',
        field: 'id',
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction();
    await queryInterface.removeConstraint(
      'devices',
      'location_id',
    );
  },
};
