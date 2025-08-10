module.exports = (sequelize, DataTypes) => {
  const deviceMetadata = sequelize.define('devices_metadata', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    device_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    key: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
    tableName: 'devices_metadata',
  });
  deviceMetadata.associate = (models) => {
    deviceMetadata.belongsTo(models.devices, { foreignKey: 'device_id', targetKey: 'id' });
  };
  return deviceMetadata;
};
