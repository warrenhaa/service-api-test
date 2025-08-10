module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`WITH dups as (
      select * from activity_log_communication_configs  where event_name in
      (select event_name from activity_log_communication_configs 
      group by event_name having count(*)>1)	
      )
      DELETE FROM activity_log_communication_configs USING dups
      WHERE dups.event_name = activity_log_communication_configs.event_name
      AND dups.created_at <= activity_log_communication_configs.created_at;`);

    await queryInterface.changeColumn('activity_log_communication_configs', 'event_name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
  },
};
