module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('occupants', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    cognito_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    identity_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    company_id: Sequelize.UUID,
  }),
  down: (queryInterface) => queryInterface.dropTable('occupants'),
};
