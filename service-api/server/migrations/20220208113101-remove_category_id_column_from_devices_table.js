module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('devices', 'category_id');
  },

  down: async (queryInterface) => {
    await queryInterface.addColumn('devices', 'category_id');
  },
};
