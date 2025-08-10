module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('occupants_invitations', ['invite_code'],
    { type: 'unique' }),
  down: async () => {
  },
};
