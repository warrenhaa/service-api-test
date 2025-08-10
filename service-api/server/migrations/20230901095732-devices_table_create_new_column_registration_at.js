module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('devices', 'registered_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.sequelize.query(`
    update devices set registered_at = created_at where is_manually_added = true
    `);
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('devices', 'registered_at');
  },
};