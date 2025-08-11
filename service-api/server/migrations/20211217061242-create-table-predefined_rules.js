module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('predefined_rules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      rule: {
        allowNull: false,
        type: Sequelize.JSONB,
      },
      action_code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      source_device_id: {
        allowNull: false,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'devices',
          key: 'id',
        },
      },
      target_device_id: {
        allowNull: false,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'devices',
          key: 'id',
        },
      },
      gateway_id: {
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
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
    .then(() => queryInterface.addIndex('predefined_rules', ['action_code']))
      .then(() => queryInterface.addConstraint('predefined_rules',  {fields:['action_code', 'gateway_id', 'target_device_id', 'source_device_id'], type: 'unique' }));
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('predefined_rules');
  },
};
