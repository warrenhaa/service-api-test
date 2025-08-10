const view_name = 'location_managers_locations_view';
const new_query = `SELECT l.id,
l.name,
l.container_id,
l.path,
l.company_id,
lt.id AS location_type_id,
lt.name AS location_type_name,
lp.id AS locations_permissions_id,
lp.user_id,
lp.role
FROM locations l
 JOIN locations_permissions lp ON lp.location_id = l.id
 JOIN location_types lt ON lt.id = l.type_id
WHERE l.container_id IS NULL OR NOT (l.container_id IN ( SELECT lp1.location_id
       FROM locations_permissions lp1
      WHERE lp1.user_id = lp.user_id));`;

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`CREATE OR REPLACE VIEW ${view_name} AS ${new_query}`);
  },
  down(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`DROP VIEW ${view_name}`);
  },
};
