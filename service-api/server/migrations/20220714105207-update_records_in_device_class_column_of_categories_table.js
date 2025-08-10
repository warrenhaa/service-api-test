module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    update categories set device_class ='Group1' where model  in ('SS882ZB', 'OS600', 'SS912ZB', 'HDW10ZB', 'SW600',
    'NTSW600', 'SS881ZB', 'CTLS634', 'PS600', 'SS909ZB', 'HTS10ZB', 'CTLS631_', 'CTLS632', 'CTLS633', 'A60_TW_Z3', 'B40_TW_Z3', 'B40_DIM_Z3',
    'CLA60_RGBW_OSRAM', 'Classic_A60_W_clear___LIGHTIFY', 'PAR16_DIM_Z3', 'PAR16_RGBW_Z3', 'PAR16_TW_Z3', 'Tibea_TW_Z3', 'FLEX_RGBW_Z3', 
    'MR16_TW_OSRAM', 'Outdoor_FLEX_RGBW_Z3', 'WLS600', 'SS901ZB', '3315_G', '3315_S', 'moisturev4', 'ST100ZB', 'ST101ZB',
    'SC900ZB', 'SC906ZB', 'SC904ZB', 'it600WC', 'IT600PumpWC', 'AWC_Z', 'RE600', 'it600Repeater', 'ECM600', 'SAL2EM1', 'ZG9101SAC_HP',
    'DI600', 'Arjonstop', 'AnionStop', 'it600Receiver', 'FC600', 'SB600', 'CSB600', 'SS883ZB', 'SS884ZB', 'SR600', 'SC824ZB','SC812ZB', '45856',
    '43102', '45857', 'haloHW', 'halo', 'RE600', 'SC102ZB', 'ST103ZB', 'SX903ZB', 'RS600', 'CTLS631E', 'CTLS632E', 'CTLS633E', 'CTLS634E','SV02_412_MP_1.2',
    'RS_THP_MP_1.0'
);`);

    await queryInterface.sequelize.query(`
    update categories set device_class ='Group2' where model  in ('sau2ag1', 'ST898ZB', 'ST898ZBR', 'ST899ZB', 'ST880ZB',
    'ST880ZBPB', 'SX885ZB', 'SP600', 'SPE600', 'CTLP631', 'CTLP632', 'it600MINITRV', 'AVA10M30RF', 'it600HW', 'it600HW_AC', 'HTRHW_RF',
    'it600ThermHW', 'it600ThermHW_AC', 'HTR_RF_20_', 'HTRP_RF_50_', 'HTRS_RF_30_', 'SQ610RF', 'SQ610', 
    'SQ610RF_WB_', 'SQ610_WB_', 'WQ610RF', 'TS600', 'TS600HW', 'NTVS41', 'NTVS41HW', 'NTSQ605RF', 'ALTHCSQ605RF',
    'SQ605RF_WB_', 'AJSQ605RF', 'MS600', 'PIRSensor_EM', 'ZB_SMART_PIR_ALL_ONOFV2', 'ZB_MotionSensor_S00000001', 'ZB_MotionSensor_D0000', 
    'Motion_Sensor_A_', '3041', '3043', 'AWRT10RF', 'CTLV630', 'PUMV011', 'PUMT011'
);`);
  },

  down: async (queryInterface, Sequelize) => {
  },
};
