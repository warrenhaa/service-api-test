module.exports = {
  up: (queryInterface) => {
    queryInterface.bulkDelete('user_datatable_preferences', null, {
      truncate: true,
    });
    return queryInterface.addConstraint('user_datatable_preferences', 
      { fields:['user_id'],type: 'unique', name: 'user_datatable_preferences_user_id_unique_key' });
  },
  down: (queryInterface) => { queryInterface.dropTable('user_datatable_preferences'); },
};
