module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'configs', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.sequelize.query(`
    update companies set configs = '{
    "mobile_verificatin_enabled": true,
    "country_verification_enabled": true,
    "shared_devices_default_grid_order_enabled": false
    }' where code != 'purmo';

    update companies set configs = '{
    "mobile_verificatin_enabled": false,
    "country_verification_enabled": false,
    "shared_devices_default_grid_order_enabled": true,
    "device_provision_trycount": 3
    }' where code = 'purmo';

    `);
  },

  down: async (queryInterface) => {
    queryInterface.removeColumn('companies', 'configs');
  },
};
