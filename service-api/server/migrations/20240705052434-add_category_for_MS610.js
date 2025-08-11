module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'MS610',
      category_id: '18',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async () => {
  },
};
