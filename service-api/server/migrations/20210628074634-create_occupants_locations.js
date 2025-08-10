module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('occupants_locations', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
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
    occupant_id: {
      type: Sequelize.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'occupants',
        key: 'id',
      },
    },
    check_in_at: {
      allowNull: true,
      type: Sequelize.DATE,
    },
    check_in_by: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    check_out_at: {
      allowNull: true,
      type: Sequelize.DATE,
    },
    check_out_by: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
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
  down: (queryInterface) => queryInterface.dropTable('occupants_locations'),
};
