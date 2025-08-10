module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rule_groups', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      icon: {
        allowNull: false,
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
      rules: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
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
    await queryInterface.addIndex('rule_groups', ['name', 'icon', 'gateway_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('rule_groups');
  },
};
