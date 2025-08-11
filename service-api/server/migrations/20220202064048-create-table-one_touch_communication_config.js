module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('one_touch_communication_config', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      rule_trigger_key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gateway_id: {
        allowNull: false,
        type: Sequelize.UUID,
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
      emails: {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false,
      },
      phone_numbers: {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('one_touch_communication_config', ['rule_trigger_key', 'emails', 'phone_numbers']);
    await queryInterface.addConstraint('one_touch_communication_config',  { fields:['rule_trigger_key'], type: 'unique', name: 'rule_trigger_key-unique' });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('one_touch_communication_config', 'rule_trigger_key-unique');
    await queryInterface.dropTable('one_touch_communication_config');
  },
};
