module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('device_events_count', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            device_code: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            count: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            day: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('device_events_count');
    },
};