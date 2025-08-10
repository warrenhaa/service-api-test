module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('alert_types', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        alert_type: {
          unique: true,
          type: Sequelize.STRING,
          allowNull: false,
        },
        severity: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.JSONB,
          allowNull: false,
        },
        sms: {
          type: Sequelize.JSONB,
          allowNull: false,
        },
        notification: {
          type: Sequelize.JSONB,
          allowNull: false,
        },
        placeholders: {
          type: Sequelize.JSONB,
          defaultValue: {},
          allowNull: false,
        },
        default_message: {
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
      }, { transaction });
      await queryInterface.addIndex('alert_types', ['severity'], { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('alert_types');
  },

};
