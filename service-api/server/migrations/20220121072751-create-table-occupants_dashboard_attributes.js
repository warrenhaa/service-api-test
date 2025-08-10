module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('occupants_dashboard_attributes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      device_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'devices',
          key: 'id',
        },
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'companies',
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
      one_touch_rule_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'one_touch_rules',
          key: 'id',
        },
      },
      pin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_grouped: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      grid_order: {
        type: Sequelize.STRING,
        defaultValue: '0',
        allowNull: false,
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
    await queryInterface.dropTable('occupants_dashboard_attributes');
  },
};
