module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('location_types', 
    {fields:['name', 'company_id'], type: 'unique', name: 'name_company_unique' }),
  down: (queryInterface) => queryInterface.dropTable('location_types'),
};
