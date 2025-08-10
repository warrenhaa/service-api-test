module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('devices', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    company_id: {
      type: Sequelize.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    location_id: {
      type: Sequelize.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'locations',
        key: 'id',
      },
    },
    type: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    name: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    model: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    serial_number: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    mac_address: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    firmware_verison: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    gateway_id: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    device_code: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING,
    },
    created_by: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    updated_by: {
      allowNull: true,
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
  }),
  down: (queryInterface) => queryInterface.dropTable('devices'),
};
