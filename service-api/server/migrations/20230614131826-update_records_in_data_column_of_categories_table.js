module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      update categories set data = '{"skip_alert_properties":["ErrorIASZSTampered"]}' where model = 'PS600';
      update categories set data = '{"skip_alert_properties":["Error03"]}' 
      where model =ANY (ARRAY['SQ610', 'SQ610RF', 'SQ610_WB_', 'SQ610RF_WB_', 'SQ610RFNH', 'SQ610NH', 'SQ610RFNH_WB_', 'SQ610NH_WB_']);
      update categories set data = '{"skip_alert_properties":["ErrorIASZSAlarmed1"]}' 
      where model =ANY (ARRAY['OS600', 'SS912ZB', 'SW600', 'WLS600', 'SS901ZB', '3315-S', '3315-G', 'moisturev4', 'SS882ZB', 'CTLS634_', 'NTSW600', 'HDW10ZB', 'SS881ZB']);
      update categories set data = '{"skip_alert_properties":["ErrorIASZSAlarmed1", "ErrorIASZSAlarmed2"]}' 
      where model =ANY (ARRAY['MS600', '3041', '3043', 'ZB_MotionSensor_D0000', 'PIRSensor_EM', 'ZB_SMART_PIR_ALL_ONOFV2', 'ZB_MotionSensor_S00000001', 'Motion_Sensor_A_']);
      update categories set data = '{"skip_alert_properties": ["ErrorTherSOutdSensor", "ErrorTherSOutdSensorShort"]}' 
      where model =ANY (ARRAY['ST898ZB', 'ST898ZBR']);
      `);
  },
  down: async (queryInterface, Sequelize) => {
  },
};