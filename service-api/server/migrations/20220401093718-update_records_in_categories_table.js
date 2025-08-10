module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update categories set category_id = '1' where model ilike '%PUMG021GW%';
    update categories set category_id = '1' where model ilike '%PUMG021ZC%';
    update categories set category_id = '1' where model ilike '%SAL3AG1ZC%';
    update categories set category_id = '1' where model ilike '%SAL3AG1GW%';
    update categories set category_id = '1' where model ilike '%CTLG633ZC%';
    `);
  },

  down: async (queryInterface, Sequelize) => {
  },
};
