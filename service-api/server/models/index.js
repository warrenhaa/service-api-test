import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import configJson from '../config/config';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

const config = configJson[env];

const db = {};
let sequelize;
if (config.environment === 'production') {
  sequelize = new Sequelize(
    process.env[config.use_env_variable], config,
  );
  sequelize = new Sequelize(
    process.env.SPM_PROD_DB_NAME,
    process.env.SPM_PROD_DB_USER,
    process.env.SPM_PROD_DB_PASS, {
    host: process.env.SPM_PROD_DB_HOST,
    port: process.env.SPM_PROD_DB_PORT,
    dialect: 'postgres',
    dialectOption: {
      ssl: true,
      native: true,
    },
    logging: true,
    operatorsAliases: false,
    define: {
      paranoid: true,
      underscored: true,
      freezeTableName: true,
    },
  },
  );
} else if (config.environment === 'development') {
  sequelize = new Sequelize(
    config.database, config.username, config.password, config,
  );
} else {
  sequelize = new Sequelize(
    config.database, config.username, config.password, config,
  );
}

fs
  .readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0)
    && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
