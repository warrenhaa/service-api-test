const view_name = 'occupant_checkedin_locations_view';
const original_query = '';
const new_query = 'SELECT ol.location_id,ol.occupant_id,l.name FROM occupants_locations ol JOIN locations l ON l.id = ol.location_id where ol.status=\'checked in\'';

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`CREATE OR REPLACE VIEW ${view_name} AS ${new_query}`);
  },
  down(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`DROP VIEW ${view_name}`);
  },
};
