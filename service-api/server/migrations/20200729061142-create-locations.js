module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('locations', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    name: {
      type: Sequelize.STRING,
    },
    notes: {
      type: Sequelize.STRING,
    },
    type_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'location_types',
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
    address_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'addresses',
        key: 'id',
      },
    },
    container_id: {
      type: Sequelize.UUID,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    created_by: {
      type: Sequelize.STRING,
    },
    updated_by: {
      type: Sequelize.STRING,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('locations'),
};
