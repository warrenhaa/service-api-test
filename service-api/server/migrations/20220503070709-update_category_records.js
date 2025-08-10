module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'SAL3AG1_ZC',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      model: 'SAU3AG1_ZC',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async () => {
  },
};
