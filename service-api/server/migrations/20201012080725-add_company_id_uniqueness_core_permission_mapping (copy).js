module.exports = {
  up: (queryInterface) => {
    try {
      queryInterface.removeConstraint('core_permissions_mappings', 'core_permissions_mappings_name_key');
    } catch (error) {
    }
    return queryInterface.addConstraint('core_permissions_mappings', 
      {fields:['name', 'company_id'], type: 'unique', name: 'core_permission_mapping_unique' });
  },
  down: (queryInterface) => { queryInterface.dropTable('core_permissions_mappings'); },
};
