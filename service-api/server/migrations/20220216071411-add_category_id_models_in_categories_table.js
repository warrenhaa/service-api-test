module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'SS909ZB',
      category_id: '11',
      name: 'Remote Temperature Sensors',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'HTS10ZB',
      category_id: '11',
      name: 'Remote Temperature Sensors',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'SS901ZB',
      category_id: '14',
      name: 'Water Leak Sensors',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'HDW10ZB',
      category_id: '4',
      name: 'Window Monitors',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },
  down: async (queryInterface) => { await queryInterface.bulkDelete('categories', null, {}); },
};
