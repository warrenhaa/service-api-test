module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('occupants', ['cognito_id', 'company_id'],
    { type: 'unique' }),
  down: async () => {
  },
};
