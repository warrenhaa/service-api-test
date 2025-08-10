module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('companies', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    address_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'addresses',
        key: 'id',
      },
      unique: true,
    },
    code: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    aws_cognito_details: {
      type: Sequelize.JSONB,
      allowNull: false,
    },
    aws_iot_key: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_iot_credentials: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    aws_iam_access_key: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_iam_access_secret: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_s3_bucket_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_topics_to_subscribe: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    rate_limit_policy_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    root_user_id: {
      type: Sequelize.UUID,
      allowNull: true,
    },
    account_settings: {
      type: Sequelize.JSONB,
      allowNull: false,
    },
    created_by: {
      type: Sequelize.STRING,
    },
    updated_by: {
      type: Sequelize.STRING,
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
  down: (queryInterface) => queryInterface.dropTable('companies'),
};
