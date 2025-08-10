const Day = process.env.OCCUPANT_EXPIRE_AFTER_DAYS || 7;
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('occupants_invitations', 'expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.sequelize
      .query(`update "occupants_invitations" set expires_at = created_at + interval '${Day}' day`);
    await queryInterface.changeColumn('occupants_invitations', 'expires_at', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('occupants_invitations', 'expires_at');
  },
};
