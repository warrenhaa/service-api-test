module.exports = (sequelize, DataTypes) => {
  const occupantsEquipmentsData = sequelize.define('occupants_equipments_data', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    value: {
      allowNull: false,
      type: DataTypes.JSONB,
    },
    occupant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'occupants',
        key: 'id',
      },
    },
    notification_token_id: {
      type: DataTypes.UUID,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'occupants_notification_tokens',
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
  },
  {
    freezeTableName: true,
    tableName: 'occupants_equipments_data',
  });
  return occupantsEquipmentsData;
};
