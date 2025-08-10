module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
        delete from device_alerts where alert_code = 'OnlineStatus_i' and device_id in (select id from devices where status='online');
        delete from device_alerts where alert_code = 'OnlineStatus_i' and device_id in (
          select A.device_id from (
          select device_id ,count(*) from device_alerts
          where alert_code in ('connected',
          'OnlineStatus_i')  
          group by device_id 
          order by count(*) desc) as A where A.count >1);
        update device_alerts set alert_code = 'OnlineStatus_i' where alert_code = 'connected';
        update device_alerts set alert_type = alert_code;
      `);
  },

  down: async (queryInterface, Sequelize) => {
  },
};
