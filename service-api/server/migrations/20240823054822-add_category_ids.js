module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('categories', [{
      model: 'SAL3AG1_GW',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('categories', [{
      model: 'SAU3AG1_GW',
      category_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('categories', [{
      model: 'NTSQ610NH',
      category_id: '13',
      name: 'Quantum Thermostats',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('categories', [{
      model: 'NTSQ610RFNH',
      category_id: '13',
      name: 'Quantum Thermostats',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('categories', [{
      model: 'CTLS631',
      category_id: '20',
      name: 'Remote Temperature Sensors',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async () => {
  },
};
