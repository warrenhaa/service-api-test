module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('occupants_invitations', 
    {fields:['invite_code'], type: 'unique' }),
  down: async () => {
  },
};
