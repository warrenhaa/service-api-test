module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('occupants_permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      gateway_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'devices',
          key: 'id',
        },
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id',
        },
      },
      receiver_occupant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'occupants',
          key: 'id',
        },
      },
      sharer_occupant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'occupants',
          key: 'id',
        },
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      start_time: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      end_time: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      is_temp_access: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      access_level: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.addIndex('occupants_permissions', ['start_time', 'end_time']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('occupants_permissions');
  },
};
