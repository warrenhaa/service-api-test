module.exports = {
  up: (queryInterface) => queryInterface.removeConstraint('occupants_locations', 'occupant_location_composite_key'),
  down: (queryInterface) => { queryInterface.dropTable('occupants_locations'); },
};
