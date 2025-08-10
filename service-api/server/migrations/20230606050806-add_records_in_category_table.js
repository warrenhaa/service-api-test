module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'PUMT021',
      category_id: '3',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async (queryInterface, Sequelize) => {
  },
};