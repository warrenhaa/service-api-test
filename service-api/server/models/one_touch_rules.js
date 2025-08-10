module.exports = (sequelize, DataTypes) => {
  const one_touch_rules = sequelize.define('one_touch_rules', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rule: {
      allowNull: false,
      type: DataTypes.JSONB,
    },
    key: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    gateway_id: {
      allowNull: false,
      type: DataTypes.UUID,
    },
    rule_trigger_key: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING,
    },
    company_id: {
      allowNull: false,
      type: DataTypes.UUID,
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
  one_touch_rules.associate = (models) => {
    one_touch_rules.belongsTo(models.companies, { foreignKey: 'company_id' });
    one_touch_rules.belongsTo(models.devices, { foreignKey: 'gateway_id' });
    one_touch_rules.hasOne(models.occupants_dashboard_attributes, { as: 'dashboard_attributes', foreignKey: 'item_id' });
    one_touch_rules.hasMany(models.one_touch_communication_configs, { as: 'communication_configs', foreignKey: 'one_touch_rule_id' });
    one_touch_rules.hasMany(models.one_touch_cb_communication_configs, { as: 'cloud_bridge_configs', foreignKey: 'one_touch_rule_id' });
  };
  return one_touch_rules;
};
