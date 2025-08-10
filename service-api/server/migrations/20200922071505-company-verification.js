module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('company_verifications', {
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
    cognito: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    elastic_search: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    topics: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    s3: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_access_key: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_secret_key: {
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
    created_by: {
      type: Sequelize.STRING,
    },
    updated_by: {
      type: Sequelize.STRING,
    },
    dynamo_db: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('company_verifications'),
};
