module.exports = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
      update categories set name ='Quantum Thermostats' where model = 'SQ610RFNH1';
      update categories set name ='Quantum Thermostats' where model = 'SQ610RFNH';
      update categories set name ='iT700Tx Thermostats' where model = 'IT700TX';
      update categories set category_id ='205' where model = 'IT700TX';`);
    },

    down: async () => {
    },
};