module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.renameTable('activity_log_configs', 'activity_log_communication_configs', { transaction });
      await queryInterface.addColumn('activity_log_communication_configs', 'company_id', {
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
    await queryInterface.renameTable('activity_log_communication_configs', 'activity_log_configs');
    await queryInterface.removeColumn('activity_log_communication_configs', 'company_id');
  },
};
