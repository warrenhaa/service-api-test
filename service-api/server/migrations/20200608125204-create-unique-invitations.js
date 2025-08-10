module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('user_invitations', ['email', 'company_id'],
    { type: 'unique', name: 'email_company_unique' }),
  down: (queryInterface) => queryInterface.dropTable('user_invitations'),
};
