module.exports = (sequelize, DataTypes) => {
  const userPreferences = sequelize.define('user_preferences', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      unique: true,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    time_format: {
      type: DataTypes.TEXT,
    },
    date_format: {
      type: DataTypes.TEXT,
    },
    temperature_format: {
      type: DataTypes.TEXT,
    },
    timezone_format: {
      type: DataTypes.TEXT,
    },
    country: {
      type: DataTypes.TEXT,
    },
  }, {});
  userPreferences.associate = (models) => {
    userPreferences.belongsTo(models.users, { foreignKey: 'id' });
    userPreferences.belongsTo(models.companies, { foreignKey: 'company_id' });
  };
  return userPreferences;
};
