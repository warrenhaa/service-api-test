module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('location_types', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    container_id: {
      type: Sequelize.UUID,
    },
    can_have_devices: {
      type: Sequelize.BOOLEAN,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    is_address_applicable: {
      type: Sequelize.BOOLEAN,
    },
    is_location_map_applicable: {
      type: Sequelize.BOOLEAN,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
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
  }),
  down: (queryInterface) => queryInterface.dropTable('location_types'),
};
