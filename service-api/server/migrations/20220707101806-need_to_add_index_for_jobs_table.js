module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addIndex('jobs', ['type', 'created_at']);
    queryInterface.addIndex('jobs', ['type', 'input', 'created_at']);
    queryInterface.addIndex('jobs', ['request_id']);
  },

  down: async (queryInterface, Sequelize) => {

  },
};
