module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('one_touch_cb_communication_configs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      gateway_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      device_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      config_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      camera_id: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      array_id: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      one_touch_rule_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'one_touch_rules',
          key: 'id',
        },
      },
      occupant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'occupants',
          key: 'id',
        },
      },
      property_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      property_value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ruleop: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('one_touch_cb_communication_configs');
  },
};
