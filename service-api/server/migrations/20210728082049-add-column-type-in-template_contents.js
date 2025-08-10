module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('template_contents', 'type', {
      type: Sequelize.TEXT,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('template_contents', 'type');
  },
};
