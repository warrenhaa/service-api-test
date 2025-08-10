const view_name = 'location_managers_user';
const new_query = `SELECT u.id,
u.cognito_id,
u.created_at,
u.updated_at,
u.invite_id,
u."isAdmin",
u.email,
u.name,
u.phone_number,
u.identity_id,
u.company_id,
lp.location_id,
lp1.user_id
FROM locations_permissions lp
 JOIN users u ON lp.user_id = u.id
 JOIN locations_permissions lp1 ON lp1.location_id = lp.location_id;`;

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`CREATE OR REPLACE VIEW ${view_name} AS ${new_query}`);
  },
  down(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`DROP VIEW ${view_name}`);
  },
};
