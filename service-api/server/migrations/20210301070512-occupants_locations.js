module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('occupants_locations', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
    },
    company_id: {
      type: Sequelize.UUID,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    occupant_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'occupants',
        key: 'id',
      },
    },
    location_id: {
      type: Sequelize.UUID,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'locations',
        key: 'id',
      },
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
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    checkin_date: {
      allowNull: true,
      type: Sequelize.DATE,
    },
    checkout_date: {
      allowNull: true,
      type: Sequelize.DATE,
    },
  }).then(() => queryInterface.addConstraint('occupants_locations', {
    fields:['company_id', 'occupant_id', 'location_id', 'status'], 
    type: 'unique',
    name: 'occupant_location_composite_key',
  })),
  down: (queryInterface) => queryInterface.dropTable('occupants_locations'),
};
