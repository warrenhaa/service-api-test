module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('schedules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      schedule: {
        allowNull: false,
        type: Sequelize.JSONB,
        defaultValue: {},
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
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex('schedules', ['schedule', 'device_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('schedules');
  },
};
