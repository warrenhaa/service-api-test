const Entities = Object.freeze({
  permissions: {
    entity_name: 'Permissions',
    event_name: {
      updated: 'PermissionUpdated',
      added: 'PermissionAdded',
      deleted: 'PermissionDeleted',
    },
  },
  rule_groups: {
    entity_name: 'RuleGroups',
    event_name: {
      added: 'RuleGroupsAdded',
      updated: 'RuleGroupsUpdated',
      deleted: 'RuleGroupsDeleted',
      enabled: 'RuleGroupEnabled',
      disabled: 'RuleGroupDisabled',
    },
  },
  single_groups: {
    entity_name: 'SingleControls',
    event_name: {
      added: 'SingleControlAdded',
      updated: 'SingleControlUpdated',
      deleted: 'SingleControlDeleted',
      enabled: 'SingleControlEnabled',
      disabled: 'SingleControlDisabled',
    },
  },
  schedules: {
    entity_name: 'Schedules',
    event_name: {
      added: 'ScheduleAdded',
      updated: 'ScheduleUpdated',
      deleted: 'ScheduleDeleted',
    },
  },
  one_touch_communication_config: {
    entity_name: 'OneTouchCommunicationConfig',
    event_name: {
      added: 'OneTouchCommunicationConfigAdded',
      updated: 'OneTouchCommunicationConfigUpdated',
      deleted: 'OneTouchCommunicationConfigDeleted',
      multiple_deleted: 'OneTouchCommunicationConfigsDeleted',
    },
  },
  occupants_notification_tokens: {
    entity_name: 'OccupantsNotificationTokens',
    event_name: {
      added: 'OccupantNotificationTokenAdded',
      updated: 'OccupantNotificationTokenUpdated',
      deleted: 'OccupantNotificationTokenDeleted',
    },
  },
  occupants_equipments_data: {
    entity_name: 'OccupantsEquipmentsData',
    event_name: {
      added: 'OccupantsEquipmentsDataAdded',
      updated: 'OccupantsEquipmentsDataUpdated',
      deleted: 'OccupantsEquipmentsDataDeleted',
    },
  },
  occupants_dashboard_attributes: {
    entity_name: 'OccupantsDashboardAttributes',
    event_name: {
      added: 'OccupantDashboardAttributeAdded',
      updated: 'OccupantDashboardAttributeUpdated',
      deleted: 'OccupantDashboardAttributeDeleted',
    },
  },
  occupants_permissions: {
    entity_name: 'OccupantsPermissions',
    event_name: {
      added: 'OccupantPermissionAdded',
      updated: 'OccupantPermissionUpdated',
      welcome_tile_updated: 'OccupantPermissionWelcomeTileUpdated',
      deleted: 'OccupantPermissionDeleted',
      resend: 'OccupantPermissionResent',
    },
  },
  camera_occupants_permissions: {
    entity_name: 'OccupantsPermissions',
    event_name: {
      added: 'OccupantCameraPermissionAdded',
      updated: 'OccupantCameraPermissionUpdated',
      deleted: 'OccupantCameraPermissionDeleted',
      resend: 'OccupantCameraPermissionResent',
    },
  },
  camera_devices: {
    entity_name: 'CameraDevices',
    event_name: {
      added: 'CameraDeviceAdded',
      updated: 'CameraDeviceUpdated',
      deleted: 'CameraDeviceDeleted',
    },
  },
  occupants_groups: {
    entity_name: 'OccupantsGroups',
    event_name: {
      added: 'OccupantGroupAdded',
      updated: 'OccupantGroupUpdated',
      deleted: 'OccupantGroupDeleted',
    },
  },
  occupants_groups_devices: {
    entity_name: 'OccupantsGroupsDevices',
    event_name: {
      added: 'OccupantGroupDeviceAdded',
      updated: 'OccupantGroupDeviceUpdated',
      deleted: 'OccupantGroupDeviceDeleted',
    },
  },
  occupants_metadata: {
    entity_name: 'OccupantsMetadata',
    event_name: {
      added: 'OccupantMetadataAdded',
      updated: 'OccupantMetadataUpdated',
      deleted: 'OccupantMetadataDeleted',
    },
  },
  devices_metadata: {
    entity_name: 'DevicessMetadata',
    event_name: {
      added: 'DevicessMetadataAdded',
      updated: 'DevicessMetadataUpdated',
      deleted: 'DevicessMetadataDeleted',
    },
  },
  locations: {
    entity_name: 'Locations',
    event_name: {
      created: 'LocationCreated',
      removed: 'LocationRemoved',
      updated: 'LocationUpdated',
      added: 'LocationAdded',
      deleted: 'LocationDeleted',
      unlinked: 'LocationUnlinked',
      linked: 'LocationLinked',
      unassigned: 'LocationUnassigned',
      assigned: 'LocationAssigned',
      occupant_checked_in: 'OccupantCheckedIn',
      occupant_checked_out: 'OccupantCheckedOut',
      occupant_invitation_updated: 'OccupantInviteUpdated',
      occupant_invitation_deleted: 'OccupantInviteDeleted',
      gateway_linked: 'GatewayLinked',
      gateway_unlinked: 'GatewayUnlinked',
      device_linked: 'DeviceLinked',
      device_unlinked: 'DeviceUnlinked',
    },
  },
  companies: {
    entity_name: 'Companies',
    event_name: {
      updated: 'CompanyUpdated',
      added: 'CompanyAdded',
      deleted: 'CompanyDeleted',
    },
  },
  core_permissions: {
    entity_name: 'CorePermissions',
    event_name: {
      updated: 'CorePermissionUpdated',
      added: 'CorePermissionAdded',
      deleted: 'CorePermissionDeleted',
    },
  },
  addresses: {
    entity_name: 'Addresses',
    event_name: {
      updated: 'AddressUpdated',
      added: 'AddressAdded',
      deleted: 'AddressDeleted',
    },
  },
  corepermissions_mappings: {
    entity_name: 'CorePermissionMappings',
    event_name: {
      updated: 'CorePermissionMappingUpdated',
      added: 'CorePermissionMappingAdded',
      deleted: 'CorePermissionMappingDeleted',
    },
  },
  invitations: {
    entity_name: 'Invitations',
    event_name: {
      accepted: 'InviteAccepted',
      rejected: 'InviteRejected',
      expired: 'InviteExpired',
      added: 'InviteSent',
      deleted: 'InviteDeleted',
      resent: 'InviteResent',
      confirmed: 'InviteConfirmed',
      edit_permissions: 'InvitePermissionEdited',
      edit_permissions_id_not_found: 'InviteNotFound',
      edit_permissions_id_already_accepted: 'InviteAlreadyAccepted',
    },
  },
  occupant: {
    entity_name: 'Occupants',
    event_name: {
      invite_added: 'OccupantInviteAdded',
      invite_resend: 'OccupantInviteResent',
      invite_delete: 'OccupantInviteDeleted',
      invite_expire: 'OccupantInviteExpired',
      added: 'OccupantRegistered',
      joined: 'OccupantJoined',
      updated: 'OccupantUpdated',
      deleted: 'OccupantDeleted',
      check_in: 'OccupantCheckedIn',
      check_out: 'OccupantCheckedOut',
      status_checkin: 'checked in',
      status_checkout: 'checked out',
      status_accepted: 'accepted',
      status_resend: 'resend',
      status_expired: 'expired',
      location_updated: 'LocationUpdated',
      invitation_checkin: 'OccupantInviteForCheckIn',
      invitation_checkin_updated: 'OccupantInviteOfCheckInUpdated',
      delete_job: 'DeleteOccupantJobCreated',
      owner_occupant_permission_failed: 'OwnerOccupantPermissionFailed',
    },
  },
  location_types: {
    entity_name: 'LocationTypes',
    event_name: {
      added: 'LocationTypeAdded',
      deleted: 'LocationTypeDeleted',
      updated: 'LocationTypeUpdated',
    },
  },
  users: {
    entity_name: 'Users',
    event_name: {
      added: 'UserRegistered',
      deleted: 'UserDeleted',
      updated: 'UserUpdated',
      admin_status_updated: 'UserStatusUpdated',
      inviteUserRegistered: 'InviteUserRegistered',
      unassigned: 'UserUnassigned',
      assigned: 'UserAssigned',
      delete_job: 'DeleteUserJobCreated',
    },
  },
  user_attributes: {
    entity_name: 'UserAttributes',
    event_name: {
      attribute_updated: 'UserAttributeUpdated',
    },
  },
  jobs: {
    entity_name: 'CreateJobs',
    event_name: {
      user_delete_job: 'deleteUser',
      occupant_delete_job: 'deleteOccupant',
      delete_location: 'deleteLocation',
      occupant_delete_gateway_job: 'occupantGatewayDelete',
    },
  },
  location_permissions: {
    entity_name: 'LocationPermissions',
    event_name: {
      updated: 'LocationPermissionUpdated',
      added: 'LocationPermissionAdded',
      deleted: 'LocationPermissionDeleted',
    },
  },
  devices: {
    entity_name: 'Devices',
    event_name: {
      updated: 'DeviceUpdated',
      added: 'DeviceAdded',
      gateway_added: 'GatewayAdded',
      deleted: 'DeviceDeleted',
      multiple_updated: 'DevicesUpdated',
      device_location_updated: 'DeviceLocationUpdated',
      link_gateway_location: 'GatewayLocationLinked',
      link_device_location: 'DeviceLocationLinked',
      unlink_gateway_location: 'GatewayLocationUpdated',
      unlink_device_location: 'DeviceLocationUpdated',
      gateway_deleted: 'GatewayDeleted',
      owner_unregistered_gateway: 'OwnerUnregisteredGateway',
      gateway_unregistered: 'GatewayUnregistered',
      location_access_shared: 'LocationAccessShared',
      location_access_unshared: 'LocationAccessNotShared',
      location_access_removed: 'LocationAccessRemoved',
      location_access_not_removed: 'LocationAccessNotRemoved',
    },
  },
  models: {
    entity_name: 'Models',
    event_name: {
      added: 'ModelAdded',
      deleted: 'ModelDeleted',
      updated: 'ModelUpdated',
    },
  },
  user_datatable_preferences: {
    entity_name: 'UserDatatablePreferences',
    event_name: {
      updated: 'PreferenceUpdated',
      added: 'PreferenceAdded',
      deleted: 'PreferenceDeleted',
    },
  },
  occupants_device_actions: {
    entity_name: 'OccupantDeviceActions',
    event_name: {
      updated: 'OccupantDeviceActionUpdated',
      added: 'OccupantDeviceActionAdded',
      deleted: 'OccupantDeviceActionDeleted',
    },
  },
  occupants_gateway_status: {
    entity_name: 'OccupantGatewayStatuses',
    event_name: {
      updated: 'OccupantGatewayStatusUpdated',
      added: 'OccupantGatewayStatusAdded',
      deleted: 'OccupantGatewayStatusDeleted',
    },
  },
  occupants_device_attributes: {
    entity_name: 'OccupantDeviceAttributes',
    event_name: {
      updated: 'OccupantDeviceAttributeUpdated',
      added: 'OccupantDeviceAttributeAdded',
    },
  },
  occupants_attributes: {
    entity_name: 'OccupantAttributes',
    event_name: {
      updated: 'OccupantAttributeUpdated',
      added: 'OccupantAttributeAdded',
    },
  },
  occupants_notification_token: {
    entity_name: 'OccupantNotificationTokens',
    event_name: {
      added: 'OccupantNotificationTokenAdded',
      deleted: 'OccupantNotificationTokenDeleted',
    },
  },
  occupants_alert_config: {
    entity_name: 'OccupantAlertConfigs',
    event_name: {
      added: 'OccupantAlertConfigAdded',
      updated: 'OccupantAlertConfigUpdated',
    },
  },
  occupants_device_groups: {
    entity_name: 'OccupantDeviceGroups',
    event_name: {
      updated: 'OccupantDeviceGroupUpdated',
      added: 'OccupantDeviceGroupAdded',
      deleted: 'OccupantDeviceGroupDeleted',
    },
  },
  occupants_permission: {
    entity_name: 'OccupantPermissions',
    event_name: {
      updated: 'OccupantPermissionUpdated',
      added: 'OccupantPermissionAdded',
    },
  },
  occupants_gateway_devices: {
    entity_name: 'OccupantGatewayDevices',
    event_name: {
      updated: 'OccupantGatewayDeviceUpdated',
      added: 'OccupantGatewayDeviceAdded',
      deleted: 'OccupantGatewayDeviceDeleted',
    },
  },
  gateway_attributes: {
    entity_name: 'GatewayAttributes',
    event_name: {
      updated: 'GatewayAttributeUpdated',
      added: 'GatewayAttributeAdded',
    },
  },
  occupants_gateway_attributes: {
    entity_name: 'OccupantGatewayAttributes',
    event_name: {
      updated: 'OccupantGatewayAttributeUpdated',
      added: 'OccupantGatewayAttributeAdded',
    },
  },
  user_preferences: {
    entity_name: 'UserPreferences',
    event_name: {
      updated: 'UserPreferencesUpdated',
      added: 'UserPreferencesAdded',
    },
  },
  notes: {
    entity_name: 'notes',
    event_name: {
      added: 'New Record Added',
      updated: 'Existing Record Updated',
      deleted: 'Record Deleted',
      multiple_invite_expired: 'Invitations Expired',
      invite_expire: 'Invite Expired',
      invite_resend: 'Invitation Resent',
      invite_accepted: 'Invite Accepted',
      invite_permission_updated: 'Invite Permissions Updated',
      location_access_success: 'LocationAccessSharedSuccessfully',
      location_access_failed: 'LocationAccessSharingFailed',
      location_access_unshared_success: 'LocationAccessUnsharedSuccessfully',
      location_access_unshared_failed: 'LocationAccessUnsharingFailed',
    },
  },
  one_touch_rules: {
    entity_name: 'OneTouchRules',
    event_name: {
      added: 'OneTouchRuleAdded',
      deleted: 'OneTouchRuleDeleted',
      updated: 'OneTouchRuleUpdated',
      cbAdded: 'CbConfigsAdded',
      cbDeleted: 'CbConfigsDeleted',
    },
  },
  predefined_rules: {
    entity_name: 'PreDefinedRules',
    event_name: {
      added: 'PreDefinedRuleAdded',
      deleted: 'PreDefinedRuleDeleted',
      updated: 'PreDefinedRuleUpdated',
    },
  },
  importLocations: {
    entity_name: 'importLocationsJob',
    event_name: {
      job: 'JobInfo',
    },
  },
  importGatewayLocations: {
    entity_name: 'importGatewayLocationsJob',
    event_name: {
      job: 'JobInfo',
    },
  },
  alert_communication_configs: {
    entity_name: 'AlertCommunicationConfigs',
    event_name: {
      added: 'AlertCommunicationConfigAdded',
      updated: 'AlertCommunicationConfigUpdated',
    },
  },
  device_alerts: {
    entity_name: 'DeviceAlerts',
    event_name: {
      updated: 'DeviceAlertUpdated',
    },
  },
  device_references: {
    entity_name: 'DeviceRefereces',
    event_name: {
      deleted: 'EntityDeviceReferenceDeleted',
    },
  },
  single_control_devices: {
    entity_name: 'SingleControlsDevices',
    event_name: {
      added: 'SingleControlDeviceAdded',
      updated: 'SingleControlDeviceUpdated',
      deleted: 'SingleControlDeviceDeleted',
    },
  },
  single_controls: {
    entity_name: 'SingleControls',
    event_name: {
      added: 'SingleControlAdded',
      updated: 'SingleControlUpdated',
      deleted: 'SingleControlDeleted',
      enabled: 'SingleControlEnabled',
      disabled: 'SingleControlDisabled',
    },
  },
  occupants_permissions_metadata: {
    entity_name: 'OccupantsPermissionsMetadata',
    event_name: {
      added: 'OccupantsPermissionsMetadataAdded',
      updated: 'OccupantsPermissionsMetadataUpdated',
      deleted: 'OccupantsPermissionsMetadataDeleted',
    },
  },
  default_language: {
    event_name: {
      default: 'en',
    },
  },
  geofense_alert: {
    event_name: {
      home: 'GeofenceHomeAlert',
      away: 'GeofenceAwayAlert',
    },
  },
  categories: {
    entity_name: 'Categories',
    event_name: {
      added: 'CategoryAdded',
      updated: 'CategoryUpdated',
    },
  },
});

export default Entities;
