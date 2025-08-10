module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update categories set name = 'Hot Water Timer' where category_id = '28';
    `);
  },

  down: async (queryInterface, Sequelize) => {
  },
};
