module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update categories set device_class ='Group2' where model  in ('SAU2AG1_GW'
);`);
  },

  down: async (queryInterface, Sequelize) => {
  },
};