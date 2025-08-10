module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'CTLG630GW',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'CTLG630ZC',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },
  down: async (queryInterface) => { await queryInterface.bulkDelete('categories', null, {}); },
};
