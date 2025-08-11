module.exports = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
        delete from configs where key ='background_server_constants';
        INSERT INTO configs(
        id, key, value, created_at, updated_at)
        VALUES ('8f2106bb-8b4a-43cc-9ef4-2e7cb139c9d2', 'background_server_constants',
        '{ "purmo_low_battery_devices" :  ["PUMT031", "PUMV011", "CTLT540", "CTLV640", "PUMT021"] }', '2023-02-07 09:26:59.109+05:30', '2023-02-07 09:26:59.109+05:30');
        `);
    },
    down: async () => {
    },
};