module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameColumn('template_contents', 'event_name', 'key');
  },

  down: async () => {
  },
};
