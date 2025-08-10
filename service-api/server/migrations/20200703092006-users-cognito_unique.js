module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('users', ['cognito_id', 'company_id'],
    { type: 'unique', name: 'cognito_company_unique' }),
  down: (queryInterface) => queryInterface.dropTable('user_invitations'),
};
