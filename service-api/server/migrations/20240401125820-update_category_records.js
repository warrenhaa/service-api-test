module.exports = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
      update categories set model ='SIR600' where model = 'SIR600 ';
      update categories set name ='Smart IR AC Controllers' where model = 'SIR600';`);
    },

    down: async () => {
    },
};