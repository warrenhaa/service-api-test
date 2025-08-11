module.exports = {
  up: async (queryInterface) => {
    try {
      await queryInterface.removeConstraint(
        'core_permissions',
        'core_permissions_user_id_fkey'
      );
    } catch (error) {
      console.log('Constraint did not exist, continuing...');
    }
    await queryInterface.addConstraint('core_permissions', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'core_permissions_user_id_fkey',
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
      'core_permissions',
      'users_address_id_fkey',
    );
  },
};
