module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'PUMM01102',
      category_id: '100',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },
  down: async (queryInterface) => { await queryInterface.bulkDelete('categories', null, {}); },
};
