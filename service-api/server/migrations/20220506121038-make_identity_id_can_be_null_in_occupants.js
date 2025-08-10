module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('occupants', 'identity_id', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
  },
};
