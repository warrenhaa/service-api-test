module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update categories set category_id = '6' where model ilike '%it600Receiver%';
  `);
  },

  down: async () => {
  },
};
