module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('core_permissions', ['company_id', 'user_id', 'core_permission_mapping_id', 'access_level'],
    { type: 'unique', name: 'permission_unique' }),
  down: (queryInterface) => queryInterface.dropTable('core_permissions'),
};
