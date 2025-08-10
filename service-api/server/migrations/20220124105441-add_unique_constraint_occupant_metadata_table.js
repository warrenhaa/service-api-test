module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('occupants_metadata', ['key', 'occupant_id'], { type: 'unique', name: 'key_occupant_id_unique' });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('occupants_metadata', 'key_occupant_id_unique');
  },
};
