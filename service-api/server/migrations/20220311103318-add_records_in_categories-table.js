module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
    update categories set category_id = '1' where model = 'CTLG633GW';
    update categories set category_id = '11' where model = 'CTLV630';
    `);
    await queryInterface.bulkInsert('categories', [{
      model: 'CTLT530',
      category_id: '3',
      name: 'Thermostat',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'CTLR533',
      category_id: '8',
      name: 'Receivers',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'PUMM01101',
      category_id: '100',
      name: 'Yali',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'PUMG011GW',
      category_id: '1',
      name: 'GateWay',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'PUMT031',
      category_id: '3',
      name: 'Thermostat',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'PUMR011',
      category_id: '8',
      name: 'Receivers',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'PUMM01131',
      category_id: '100',
      name: 'Yali',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'CTLG633',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'PUMG021',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'SAL3AG1',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      model: 'SAU3AG1',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },
  down: async (queryInterface) => { await queryInterface.bulkDelete('categories', null, {}); },
};
