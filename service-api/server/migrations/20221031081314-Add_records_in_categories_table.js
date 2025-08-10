module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'it600MINITRVNH',
      category_id: '10',
      name: 'TRVs',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      model: 'TRV10RFM',
      category_id: '10',
      name: 'TRVs',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async (queryInterface, Sequelize) => {
  },
};