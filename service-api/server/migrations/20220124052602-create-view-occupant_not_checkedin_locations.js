const view_name = 'occupant_notcheckedin_locations_view';
const new_query = `SELECT l.id,
l.name,
l.type_id,
l.company_id,
l.address_id,
l.container_id,
l.path,
o.id AS occupant_id
FROM locations l,
occupants o
WHERE (l.type_id IN ( SELECT lt.id
       FROM location_types lt
      WHERE lt.name::text = 'room'::text OR lt.name::text = 'house'::text)) AND NOT (l.id IN ( SELECT ol.location_id
       FROM occupants_locations ol
      WHERE ol.occupant_id = o.id AND ol.status::text = 'checked in'::text));`;

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`CREATE OR REPLACE VIEW ${view_name} AS ${new_query}`);
  },
  down(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`DROP VIEW ${view_name}`);
  },
};
