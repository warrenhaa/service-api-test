module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeConstraint(
      'locations_permissions',
      'locations_permissions_user_id_fkey',
    );
    await queryInterface.addConstraint('locations_permissions', ['user_id'], {
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
