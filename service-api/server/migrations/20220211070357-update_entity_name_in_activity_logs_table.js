module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
    update activity_logs set event_name = 'OccupantInviteUpdated' where event_name = 'OccupantInvitationUpdated'
     and entity = 'Locations'
    `);

    await queryInterface.sequelize.query(`
    update activity_logs set event_name = 'OccupantInviteDeleted' where event_name = 'OccupantInvitationDeleted'
     and entity = 'Locations'
    `);
  },

  down: async (queryInterface, Sequelize) => { },
};
