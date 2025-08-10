module.exports = (sequelize, DataTypes) => {
  const user_datatable_preferences = sequelize.define('user_datatable_preferences', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    preference: {
      type: DataTypes.JSONB,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
    },

  }, {});
  user_datatable_preferences.associate = function (models) {
    user_datatable_preferences.belongsTo(models.users, { foreignKey: 'user_id' });
  };
  return user_datatable_preferences;
};
