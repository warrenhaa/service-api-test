module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    delete from device_events where id in(select e.id from device_events as e 
    join devices as d on d.device_code = e.device_code 
    where e.created_at < d.created_at and (e.property_name != 'connected' and d.type !='gateway') and e.company_id = d.company_id)
    `);
  },

  down: async (queryInterface, Sequelize) => {
  },
};
