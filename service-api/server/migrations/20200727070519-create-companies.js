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
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    aws_cognito_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_cognito_region: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_cognito_user_pool: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_cognito_identity_pool: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_cognito_userpool_web_client_id: {
      type: Sequelize.STRING,
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
    device_to_user_list: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    user_to_device_list: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_topics_to_subscribe: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_region: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aws_iot_end_point: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    es_endpoint: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    es_username: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    es_password: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    index_name: {
      type: Sequelize.STRING,
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
