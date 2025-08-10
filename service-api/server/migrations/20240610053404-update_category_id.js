module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
    delete from categories where model ='PUMM012';`);
    await queryInterface.bulkInsert('categories', [{
      model: 'PUMM012',
      category_id: '100',
      name: 'Yali',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async () => {
  },
};
