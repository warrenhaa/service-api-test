module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameColumn('occupants', 'name', 'first_name');
  },

  down: async (queryInterface) => {
    await queryInterface.renameColumn('occupants', 'first_name', 'name');
  },
};
