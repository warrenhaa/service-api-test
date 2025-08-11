module.exports = {
  up: async (queryInterface) => {
    try {
      await queryInterface.removeConstraint(
        'devices',
        'devices_location_id_fkey',
      );
    } catch (error) {
      
    }
 
    await queryInterface.addConstraint('devices',  {
      fields:['location_id'],
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
