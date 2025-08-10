module.exports = {
  up: (queryInterface) => queryInterface.dropTable('occupants', {}),
  down: (queryInterface) => queryInterface.dropTable('occupants'),
};
