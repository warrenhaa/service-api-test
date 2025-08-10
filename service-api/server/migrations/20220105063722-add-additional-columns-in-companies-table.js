module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('companies', 'contact_details', {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false,
      }, { transaction }),
      await queryInterface.addColumn('companies', 'address_id', {
        type: Sequelize.UUID,
        allowNull: true,
      }, { transaction }),
      await queryInterface.addColumn('companies', 'site_id', {
        type: Sequelize.UUID,
        allowNull: true,
      }, { transaction }),
      await queryInterface.addColumn('companies', 'activities_configs', {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false,
      }, { transaction }),
      await queryInterface.addColumn('companies', 'alert_configs', {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false,
      }, { transaction }),
      await queryInterface.addColumn('companies', 'app_urls', {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false,
      }, { transaction }),
      await queryInterface.addColumn('companies', 'templates', {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false,
      }, { transaction }),
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: (queryInterface) => Promise.all([
    queryInterface.removeColumn('companies', 'contact_details'),
    queryInterface.removeColumn('companies', 'address_id'),
    queryInterface.removeColumn('companies', 'site_id'),
    queryInterface.removeColumn('companies', 'activities_configs'),
    queryInterface.removeColumn('companies', 'alert_configs'),
    queryInterface.removeColumn('companies', 'app_urls'),
    queryInterface.removeColumn('companies', 'templates'),
  ]),
};
