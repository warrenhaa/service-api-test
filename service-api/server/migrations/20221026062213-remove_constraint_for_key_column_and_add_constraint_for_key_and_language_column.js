module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeConstraint('template_contents', 'template_contents_key_key');
    await queryInterface.addConstraint('template_contents', ['key', 'language'],
      { type: 'unique', name: 'key_language_unique_key' });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('template_contents', 'key_language_unique_key');
  },
}