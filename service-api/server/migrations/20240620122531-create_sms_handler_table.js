module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sms_handler', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      module: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      company_id: {
        allowNull: false,
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
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('sms_handler');
  },
};
