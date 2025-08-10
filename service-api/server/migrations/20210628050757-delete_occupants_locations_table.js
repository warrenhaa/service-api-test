module.exports = {
  up: (queryInterface) => queryInterface.dropTable('occupants_locations', {}),
  down: (queryInterface) => queryInterface.dropTable('occupants_locations'),
};
