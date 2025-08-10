module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'SQ610RFWB',
      category_id: '13',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('categories', [{
      model: 'WBTRV10RFM',
      category_id: '11',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async (queryInterface, Sequelize) => {
  },
};