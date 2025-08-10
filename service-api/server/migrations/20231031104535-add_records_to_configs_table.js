module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      INSERT INTO configs(
id, key, value, created_at, updated_at)
VALUES ('b61be712-c037-4507-a8cf-8285b979e3ee', 'constants',
'{
    "ROLES": {
        "area": "AreaManager",
        "site": "SiteManager",
        "super": "SuperAdmin",
        "support": "CustomerSupport",
        "building": "BuildingManager"
    },
    "USERS": "users",
    "Models": {
        "smartPlug": [
            "SX885ZB",
            "SP600",
            "SPE600"
        ],
        "smartRelay": [
            "SR600",
            "SC824ZB",
            "SC812ZB"
        ],
        "thermostat": [
            "ST898ZB",
            "ST898ZBR",
            "ST899ZB",
            "ST880ZB",
            "ST880ZBPB",
            "iT600HW",
            "iT600HW-AC",
            "iT600ThermHW-AC",
            "iT600ThermHW",
            "HTR-RF(20)",
            "HTRP-RF(50)",
            "HTRS-RF(30)",
            "SQ610RF",
            "SQ610",
            "SQ610RF(WB)",
            "SQ610(WB)",
            "WQ610RF",
            "TS600",
            "TS600HW",
            "NTVS41",
            "NTVS41HW",
            "NTSQ605RF",
            "ALTHCSQ605RF",
            "SQ605RF(WB)",
            "AJSQ605RF",
            "FC600",
            "AWRT10RF",
            "iT600HW_AC",
            "SAUPTZ1PT868",
            "iT600ThermHW_AC"
        ],
        "zigbeeDimmer": [
            "DI600"
        ],
        "temperatureSensor": [
            "PS600",
            "SS909ZB",
            "HTS10ZB",
            "CTLS631",
            "CTLS632",
            "CTLS633"
        ],
        "waterShutOffValves": [
            "SC900ZB",
            "SC906ZB",
            "SC904ZB"
        ],
        "wirelessFanCoilRemotes": [
            "ST103ZB"
        ]
    },
    "DEVICES": "devices",
    "COMPANIES": "companies",
    "ErrorList": [
        "connected",
        "Error01",
        "Error02",
        "Error03",
        "Error04",
        "Error05",
        "Error06",
        "Error07",
        "Error08",
        "Error09",
        "Error10",
        "Error11",
        "Error12",
        "Error13",
        "Error14",
        "Error15",
        "Error16",
        "Error17",
        "Error18",
        "Error19",
        "Error20",
        "Error21",
        "Error22",
        "Error23",
        "Error24",
        "Error25",
        "Error26",
        "Error27",
        "Error28",
        "Error29",
        "Error30",
        "Error31",
        "Error32",
        "Error33",
        "ErrorIASZSTampered",
        "ErrorIASZSLowBattery",
        "ErrorIASZSAlarmed1",
        "ErrorIASZSAlarmed2",
        "ErrorIASZSAlarmed1ForSmokeDetector",
        "ErrorIASZSAlarmed1ForWaterLeakage",
        "ErrorIASZSTrouble",
        "ErrorIASZSACFault",
        "ErrorTherSTempSensor",
        "TRVError01",
        "TRVError22",
        "TRVError23",
        "TRVError30",
        "TRVError31",
        "ErrorTherSOutdSensor",
        "ErrorTherSOutdSensorShort",
        "ErrorTherSTempSensorShort",
        "FC600ErrorTherSTempSensor",
        "ErrorInWallSwitchReleased",
        "ErrorTherSCompressor",
        "ErrorPowerSLowBattery",
        "leakage",
        "lowBattery",
        "leakageAndLowBattery",
        "lostCommunication",
        "ErrorLossLinkStatus",
        "LeaveNetwork"
    ],
    "LOCATIONS": "locations",
    "AdminSetup": {
        "ADD_USER_TO_ADMIN_GROUP": 1,
        "REMOVE_USER_FROM_ADMIN_GROUP": -1
    },
    "COMPANY_CODES": "company_codes",
    "USERS_COGINTO": "users_cognito",
    "LOCATION_TYPES": "location_types",
    "LocationLevels": [
        "site",
        "building",
        "area",
        "floor",
        "street",
        "room",
        "house"
    ],
    "DeviceProvision": {
        "CREATE_USER_RECORD": 0,
        "REMOVE_USER_RECORD": 10,
        "REGISTER_DIVICE_OWNER": 1,
        "SHARE_DEVICE_BY_OWNER": 3,
        "ADMIN_LOCK_OWNER_OF_DEVICE": 23,
        "REMOVE_DIVICE_REGISTRATION": 2,
        "ADMIN_ASSIGN_DEVICE_TO_OWNER": 21,
        "ADMIN_UNLOCK_OWNER_OF_DEVICE": 24,
        "REMOVE_SHARE_DEVICE_BY_OWNER": 4,
        "ADMIN_REMOVE_DEVICE_FROM_OWNER": 22
    },
    "ACTIVITY_CONFIGS": "activity_configs",
    "CORE_PERMISSIONS": "core_permissions",
    "USER_PERMISSIONS": "user_permissions",
    "cameraAlertsList": [],
    "ACCESS_PERMISSIONS": "access_permissions",
    "CoOrdinatorDevices": [
        "SAU2AG1_ZC",
        "CTLG630ZC",
        "CTLG633ZC",
        "PUMG011ZC"
    ],
    "cameraNotificationList": [
        "sounddetect2",
        "sounddetect",
        "motiondetect",
        "motion_zone"
    ]
}', '2023-10-31 09:26:59.109+05:30', '2023-10-31 09:26:59.109+05:30');
      `);
  },
  down: async () => {
  },
};
