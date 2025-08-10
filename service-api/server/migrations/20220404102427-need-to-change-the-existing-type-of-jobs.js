module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query("update jobs set type='deleteUser' where type ='DeleteUser'");
    await queryInterface.sequelize.query("update jobs set type='deleteOccupant' where type ='DeleteOccupant'");
    await queryInterface.sequelize.query("update jobs set type='deleteLocation' where type ='DeleteLocation'");
  },

  down: async () => {
  },
};
