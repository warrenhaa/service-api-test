module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('occupants_permissions', 'sharer_occupant_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    await queryInterface.addConstraint('occupants_permissions', 
      { fields:['gateway_id', 'sharer_occupant_id', 'receiver_occupant_id', 'company_id'], type: 'unique', name: 'gateway_id_sharer_occupant_id_receiver_occupant_id_company_id_unique' });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('occupants_permissions', 'sharer_occupant_id');
    await queryInterface.removeConstraint('occupants_permissions', 'gateway_id_sharer_occupant_id_receiver_occupant_id_company_id_unique');
  },
};
