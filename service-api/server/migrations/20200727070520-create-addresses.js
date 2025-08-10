module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('addresses', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
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
    line_1: {
      type: Sequelize.STRING,
    },
    line_2: {
      type: Sequelize.STRING,
    },
    line_3: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
    country: {
      type: Sequelize.STRING,
    },
    zip_code: {
      type: Sequelize.STRING,
    },
    geo_location: {
      type: Sequelize.JSONB,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('addresses'),
};
