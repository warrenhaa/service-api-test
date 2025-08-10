module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'SQ610RFNH',
      category_id: '13',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      model: 'SQ610RFNH_WB_',
      category_id: '13',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      model: 'SQ610NH',
      category_id: '13',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      model: 'SQ610NH_WB_',
      category_id: '13',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      model: 'TRV10RFMNH',
      category_id: '10',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      model: 'it600ThermHWNH',
      category_id: '12',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      model: 'it600ThermHWNH_AC',
      category_id: '12',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      model: 'it600HWNH',
      category_id: '28',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      model: 'it600HWNH_AC',
      category_id: '28',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      model: 'it600WCNH',
      category_id: '6',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async () => {
  },
};
