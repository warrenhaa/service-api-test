module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update categories set category_id = '11' where model ilike '%CTLV640%';
    `);
  },

  down: async (queryInterface, Sequelize) => {
  },
};
