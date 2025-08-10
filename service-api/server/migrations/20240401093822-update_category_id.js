module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert('categories', [{
            model: 'SIR600 ',
            category_id: '206',
            name: 'Smart IR AC Controllers',
            created_at: new Date(),
            updated_at: new Date(),
        }]);
    },

    down: async () => {
    },
};
