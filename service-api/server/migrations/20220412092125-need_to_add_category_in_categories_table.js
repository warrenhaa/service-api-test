module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'PUMG011ZC',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async () => {
  },
};
