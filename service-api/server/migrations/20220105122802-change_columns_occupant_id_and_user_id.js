module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn('alert_communication_configs', 'occupant_id', {
        type: Sequelize.UUID,
        allowNull: true,
      }, { transaction });
      await queryInterface.changeColumn('alert_communication_configs', 'user_id', {
        type: Sequelize.UUID,
        allowNull: true,
      }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction();
    await queryInterface.removeColumn('alert_communication_configs', 'occupant_id');
    await queryInterface.removeColumn('alert_communication_configs', 'user_id');
  },

};
