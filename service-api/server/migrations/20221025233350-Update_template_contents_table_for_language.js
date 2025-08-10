module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update template_contents set language = 'en' where language = 'en-US';
  `);
  },

  down: async () => {
  },
};
