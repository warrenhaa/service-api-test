import AccessPermissionService from '../services/AccessPermissionService';
import CorePermissionsMappingService from '../services/CorePermissionsMappingService';

// util function to check device visibility access for user
const checkAllDevicesAccess = async (query) => {
  const corePerm = await CorePermissionsMappingService.getCorePermissionMappings(
    {
      name: 'device_visibility',
      company_id: query.companyId,
    },
  );
  const permission = await AccessPermissionService.getAccessCorePermissions(
    {
      core_permission_mapping_id: corePerm.id,
      user_id: query.userId,
      company_id: query.companyId,
    },
  );
  if (permission === null
    || permission === 'null'
    || typeof permission.device_visibility === 'undefined'
    || permission.device_visibility.indexOf(corePerm.access_levels[1]) <= -1) {
    return false;
  }

  return true;
};

export default checkAllDevicesAccess;
