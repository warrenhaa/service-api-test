module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('device_histories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      device_code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      model: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      property_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      value: {
        allowNull: false,
        type: Sequelize.JSONB,
      },
      parsed_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      event_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
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
    }).then(() => queryInterface.addIndex('device_histories', ['property_name', 'value', 'parsed_at', 'event_at', 'company_id']));
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('device_histories');
  },
};
