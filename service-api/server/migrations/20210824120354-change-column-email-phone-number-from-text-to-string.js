module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('users', 'phone_number', {
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.TEXT,
    });
    await queryInterface.changeColumn('users', 'phone_number', {
      type: Sequelize.TEXT,
    });
  },
};
