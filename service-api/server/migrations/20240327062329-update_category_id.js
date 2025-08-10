module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert('categories', [{
            model: 'IT700TX',
            category_id: '48',
            created_at: new Date(),
            updated_at: new Date(),
        }]);
        await queryInterface.bulkInsert('categories', [{
            model: 'SQ610RFNH1',
            category_id: '13',
            created_at: new Date(),
            updated_at: new Date(),
        }]);
    },

    down: async () => {
    },
};