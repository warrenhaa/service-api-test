module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'CB12RF_IT600',
      category_id: '6',
      name: 'Wireless Uncontrollable Devices',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('categories', [{
      model: 'SARCB12GW',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('categories', [{
      model: 'SARCB12ZC',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('categories', [{
      model: 'CB12RF_Z3',
      category_id: '207',
      name: 'CB12RF ZB3 Wiring Centre',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async () => {
  },
};
