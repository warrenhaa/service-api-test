module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update categories set category_id = '10' where model ilike '%it600MINITRV%';
    update categories set category_id = '10' where model ilike '%AVA10M30RF%';
    `);
  },

  down: async (queryInterface, Sequelize) => {
  },
};
