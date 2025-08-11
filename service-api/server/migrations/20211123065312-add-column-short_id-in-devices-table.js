module.exports = {
  up: async (queryInterface, Sequelize) => 
  {
    try {
      await queryInterface.addColumn('devices', 'short_id', {
        type: Sequelize.INTEGER,
      })
    } catch (error) {
      
    }
    // Promise.all([
  
 
    await queryInterface.addConstraint('devices', 
      {fields:['device_code', 'short_id'], type: 'unique', name: 'devices_device_code_short_id_uk' })
  // ])
},
  down: (queryInterface) => Promise.all([
    queryInterface.removeColumn('devices', 'short_id'),
    queryInterface.removeConstraint('devices', 'devices_device_code_short_id_uk'),
  ]),
};
