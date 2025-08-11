module.exports = {
  up: (queryInterface) => queryInterface.addConstraint(
    'locations_permissions',
    
    { fields:['company_id', 'user_id', 'location_id'],type: 'unique', name: 'location_permission_unique' },
  ),
  down: (queryInterface) => queryInterface.dropTable('core_permissions'),
};
