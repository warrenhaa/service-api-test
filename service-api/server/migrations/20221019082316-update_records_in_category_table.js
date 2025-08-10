module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update categories set category_id = '28' where model ilike '%NTVS41HW%';
    update categories set category_id = '28' where model ilike '%TS600HW%';
  `);
  },

  down: async () => {
  },
};