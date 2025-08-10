module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      queryInterface.sequelize.query('delete from device_histories', { transaction });
      await queryInterface.renameTable('device_histories', 'device_events', { transaction });
      await queryInterface.changeColumn('device_events', 'model', {
        type: Sequelize.STRING,
        allowNull: false,
      }, { transaction });
      await queryInterface.changeColumn('device_events', 'company_id', {
        type: Sequelize.UUID,
        allowNull: false,
      }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction();
    await queryInterface.renameTable('device_events', 'device_histories');
    await queryInterface.removeColumn('device_events', 'model');
    await queryInterface.removeColumn('device_events', 'company_id');
  },

};
