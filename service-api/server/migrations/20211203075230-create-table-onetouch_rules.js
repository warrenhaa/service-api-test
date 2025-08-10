module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('one_touch_rules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      rule: {
        allowNull: false,
        type: Sequelize.JSONB,
      },
      key: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      rule_trigger_key: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('one_touch_rules');
  },
};
