module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update categories set category_id = '6' where model ilike '%SS884ZB%';
    update categories set category_id = '6' where model ilike '%SS883ZB%';
    update categories set category_id = '6' where model ilike '%SB600%';
    update categories set category_id = '6' where model ilike '%CSB600%';
  `);
  },

  down: async () => {
  },
};
