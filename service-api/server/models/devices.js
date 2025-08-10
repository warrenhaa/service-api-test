module.exports = (sequelize, DataTypes) => {
  const devices = sequelize.define('devices', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'locations',
        key: 'id',
      },
    },
    rule_group_id: {
      allowNull: true,
      type: DataTypes.UUID,
      references: {
        model: 'rule_groups',
        key: 'id',
      },
    },
    type: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    name: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    model: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    status: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    short_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    serial_number: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    mac_address: {
      allowNull: true,
      type: DataTypes.STRING,
      set(v) {
        try {
          if (v) {
            if (!v.includes(':')) {
              const formatted = v.match(/.{1,2}/g);
              for (let i = formatted.length; i < 6; i += 1) {
                formatted.unshift('00');
              }
              const mc = formatted.join(':').toUpperCase();
              this.setDataValue('mac_address', mc);
            } else {
              this.setDataValue('mac_address', v);
            }
          } else {
            this.setDataValue('mac_address', null);
          }
        } catch (error) {
          this.setDataValue('mac_address', null);
        }
      },
    },
    firmware_verison: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    is_manually_added: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    gateway_id: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    device_code: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    datapoints: {
      allowNull: true,
      type: DataTypes.JSONB,
    },
    plan_code: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    created_by: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    updated_by: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    registered_at: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    timezone: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    latlong: {
      allowNull: true,
      type: DataTypes.JSONB,
    },
  }, {});
  devices.associate = function (models) {
    devices.belongsTo(models.companies, { foreignKey: 'company_id' });
    devices.belongsTo(models.locations, { as: 'locations', foreignKey: 'location_id' });
    devices.belongsTo(models.devices, { as: 'gateway', foreignKey: 'gateway_id' });
    devices.belongsTo(models.categories, { as: 'category', foreignKey: 'model', targetKey: 'model' });
    devices.hasMany(models.devices, { as: 'device', foreignKey: 'gateway_id' });
    devices.hasMany(models.occupants_groups, { foreignKey: 'item_id' });
    // gateway_devices
    devices.hasMany(models.devices, { as: 'gateway_devices', foreignKey: 'gateway_id' });
    devices.hasOne(models.devices, { as: 'coordinator_device', foreignKey: 'gateway_id' });
    devices.hasMany(models.device_alerts, { foreignKey: 'device_id' });
    devices.hasMany(models.occupants_permissions, { foreignKey: 'gateway_id' });
    devices.hasMany(models.devices_metadata, { foreignKey: 'device_id' });
    devices.hasMany(models.one_touch_rules, { foreignKey: 'gateway_id' });
    devices.hasMany(models.alert_communication_configs, { foreignKey: 'device_id' });
    devices.hasOne(models.occupants_dashboard_attributes, { as: 'dashboard_attributes', foreignKey: 'item_id' });
    devices.belongsTo(models.rule_groups, { as: 'rule_group', foreignKey: 'rule_group_id', targetKey: 'id' });
    devices.hasMany(models.camera_devices, { targetKey: 'id', foreignKey: 'gateway_id' });
  };

  return devices;
};
