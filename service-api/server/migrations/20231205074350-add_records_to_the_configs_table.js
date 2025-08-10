module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      delete from configs where key ='latest_privacy_version';
      INSERT INTO configs(
      id, key, value, created_at, updated_at)
      VALUES ('8916360d-94fc-48ed-a9f4-60b53e58064e', 'latest_privacy_version',
      '1.0', '2023-10-31 09:26:59.109+05:30', '2023-10-31 09:26:59.109+05:30');
      `);

    await queryInterface.sequelize.query(`
      delete from configs where key ='latest_term_version';
      INSERT INTO configs(
      id, key, value, created_at, updated_at)
      VALUES ('bfb4fc6b-c44d-4b9b-8a79-49b676b00849', 'latest_term_version',
      '1.0', '2023-10-31 09:26:59.109+05:30', '2023-10-31 09:26:59.109+05:30');
      `);
  },
  down: async () => {
  },
};
