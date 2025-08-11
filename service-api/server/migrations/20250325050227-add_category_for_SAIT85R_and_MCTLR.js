module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'SAIT85R',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('categories', [{
      model: 'MCTLR',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  
  },

  down: async () => {
  },
};
