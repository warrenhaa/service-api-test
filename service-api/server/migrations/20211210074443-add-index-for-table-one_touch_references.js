module.exports = {
  up: async (queryInterface) => Promise.all([
    queryInterface.addIndex('one_touch_references', ['gateway_id']),
  ]),

  down: async (queryInterface) => Promise.all([
    queryInterface.removeIndex('one_touch_references', ['gateway_id']),
  ]),
};
