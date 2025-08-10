module.exports = {
  up: (queryInterface) => Promise.all([
    queryInterface.changeColumn('devices', 'gateway_id', {
      type: 'UUID USING CAST("gateway_id" as UUID)',
      allowNull: true,
    }),
  ]),

  down: (queryInterface, Sequelize) => Promise.all([
    queryInterface.changeColumn('devices', 'gateway_id', {
      type: Sequelize.UUID,
      allowNull: true,
    }),
  ]),
};
