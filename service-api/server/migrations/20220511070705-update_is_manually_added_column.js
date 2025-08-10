module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update devices set is_manually_added = true;
       `);
  },

  down: async (queryInterface, Sequelize) => {
  },
};
