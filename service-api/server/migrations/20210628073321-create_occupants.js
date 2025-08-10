module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('occupants', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
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
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    cognito_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    invite_id: {
      type: Sequelize.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'occupants_invitations',
        key: 'id',
      },
    },
    identity_id: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
    status: {
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
  }),
  down: (queryInterface) => queryInterface.dropTable('occupants'),
};
