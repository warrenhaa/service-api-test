module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('occupants', 'language', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('occupants', 'country', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('occupants', 'last_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('occupants', 'language');
    await queryInterface.removeColumn('occupants', 'country');
    await queryInterface.removeColumn('occupants', 'last_name');
  },
};
