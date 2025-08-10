module.exports = {

  development: {
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    pool: {
      max: parseInt(process.env.POSTGRES_DB_POOL_MAX) || 30,
      min: parseInt(process.env.POSTGRES_DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.POSTGRES_DB_POOL_ACQUIRE) || 60000,
      idle: parseInt(process.env.POSTGRES_DB_POOL_IDLE) || 5000,
    },
    define: {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    logging: false,
    // logging(queryString, queryObject) {
    //   console.log(queryString);
    // },
  },

  test: {
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    pool: {
      max: parseInt(process.env.POSTGRES_DB_POOL_MAX) || 30,
      min: parseInt(process.env.POSTGRES_DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.POSTGRES_DB_POOL_ACQUIRE) || 60000,
      idle: parseInt(process.env.POSTGRES_DB_POOL_IDLE) || 5000,
    },
    define: {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    logging: false,
    // logging(queryString, queryObject) {
    //   console.log(queryString);
    // },
  },

  production: {
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    pool: {
      max: parseInt(process.env.POSTGRES_DB_POOL_MAX) || 30,
      min: parseInt(process.env.POSTGRES_DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.POSTGRES_DB_POOL_ACQUIRE) || 60000,
      idle: parseInt(process.env.POSTGRES_DB_POOL_IDLE) || 5000,
    },
    define: {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    logging: false,
    // logging(queryString, queryObject) {
    //   console.log(queryString);
    // },
  },
};
