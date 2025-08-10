module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('core_permissions', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
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
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    core_permission_mapping_id: {
      type: Sequelize.UUID,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'core_permissions_mappings',
        key: 'id',
      },
    },
    access_level: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    created_by: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    updated_by: {
      allowNull: false,
      type: Sequelize.STRING,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('core_permissions'),
};
