module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('occupants_metadata', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.TEXT,
      },
      occupant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'occupants',
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
    await queryInterface.addIndex('occupants_metadata', ['key']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('occupants_metadata');
  },
};
