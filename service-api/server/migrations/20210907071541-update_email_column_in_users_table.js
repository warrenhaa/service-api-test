module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize
      .query('delete from users where email is null');
    await queryInterface.changeColumn('users', 'email', {
      unique: true,
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.changeColumn('users', 'email', {
      unique: false,
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
