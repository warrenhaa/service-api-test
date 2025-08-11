module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('occupants', 
    {fields:['cognito_id', 'company_id'], type: 'unique' }),
  down: async () => {
  },
};
