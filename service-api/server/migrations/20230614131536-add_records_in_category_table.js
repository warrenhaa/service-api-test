module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [{
      model: '3315-S',
      category_id: '5',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('categories', [{
      model: '3315-G',
      category_id: '5',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('categories', [{
      model: 'CTLS634_',
      category_id: '9',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async (queryInterface, Sequelize) => {
  },
};