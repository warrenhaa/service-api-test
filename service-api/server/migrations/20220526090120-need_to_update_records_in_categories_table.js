module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update categories set category_id = '3' where model ilike '%PUMT011%';
    update categories set category_id = '3' where model ilike '%CTLT540%';
    `);
    await queryInterface.bulkInsert('categories', [{
      model: 'PUMT041',
      category_id: '3',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async (queryInterface, Sequelize) => {
  },
};
