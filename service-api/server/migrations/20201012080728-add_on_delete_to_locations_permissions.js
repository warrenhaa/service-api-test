module.exports = {
  up: async (queryInterface) => {
    try {
      await queryInterface.removeConstraint(
        'locations_permissions',
        'locations_permissions_user_id_fkey',
      );
    } catch (error) {
      
    }

    await queryInterface.addConstraint('locations_permissions',  {
      fields:['user_id'],
      type: 'foreign key',
      name: 'locations_permissions_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction();
    await queryInterface.removeConstraint(
      'locations_permissions',
      'locations_permissions_user_id_fkey',
    );
  },
};
