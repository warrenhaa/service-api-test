import lodash from 'lodash';
import database from '../../models';
import Logger from '../../utils/Logger';

async function getPermission(permissionData) {
  const permission = [];
  await Promise.all(permissionData.map(async (data) => {
    const locationId = data.location_id;
    const locationDetail = await database.locations.findOne({
      include: [
        {
          model: database.location_types,
          required: true,
          as: 'location_types',
        },
      ],
      where: { id: locationId },
      raw: true,
    });
    const typeName = locationDetail['location_types.name'];
    const query = {};
    const key = `path.${locationId}.${typeName}`;
    query[key] = locationDetail.name;
    const childLocations = await database.locations.findAll({ where: query, raw: true });
    childLocations.forEach(async (location) => {
      const users = await database.locations_permissions.findAll({
        where: {
          location_id: location.id,
        },
        attributes: ['user_id'],
      });
      users.forEach(async (user) => {
        const hasPermission = await database.locations_permissions
          .findOne({
            where: {
              user_id: user,
              location_id: location.id,
            },
          });
        if (!hasPermission) {
          permission.push(await database.locations_permissions
            .create({
              location_id: location.id,
              company_id: data.company_id,
              user_id: data.user_id,
              created_by: data.user_id,
              updated_by: data.user_id,
            }));
        }
      });
    });
  }));
  return permission;
}

export async function recursiveLocationPermission(locationData) {
  const permissionData = locationData.filter((e) => e);
  const data = await getPermission(permissionData);
  return data;
}

export async function setLocPermissionForTopLevels(permissionData) {
  const locationData = [...permissionData];
  await Promise.all(locationData.map(async (data) => {
    const locationDetail = await database.locations.findOne({
      where: {
        id: data.location_id,
      },
    });
    const { path } = locationDetail;
    if (path.breadcrumb) delete path.breadcrumb;
    Object.keys(path).map(async (key) => {
      const [permission] = await database.locations_permissions.findOrCreate({
        where: {
          user_id: data.user_id,
          location_id: key,
          company_id: data.company_id,
        },
      });
      return permission;
    });
  })).catch((err) => {
    Logger.error('setLocPermissionForTopLevels', err);
  });
}

export async function createLocationPermission(locationData) {
  const permission = [];
  const locationId = locationData.id;
  const locationNew = await database.locations.findOne({
    where: { id: locationData.container_id },
    raw: true,
  });
  const locationType = await database.location_types.findOne({
    where: { id: locationData.type_id },
    raw: true,
  });
  const typeName = locationType.name;
  const query = {};
  const key = `path.${locationId}.${typeName}`;
  query[key] = locationNew.name;
  const companyId = locationData.company_id;
  const users = await database.locations_permissions.findAll({
    where: {
      location_id: locationNew.id,
    },
    attributes: ['user_id', 'role'],
    raw: true,
    distinct: true,
  });
  const userList = lodash.uniq(users, JSON.stringify);
  console.info('users', userList);
  userList.forEach(async (user) => {
    console.info('^^^^^^^^^', user);
    const hasPermission = await database.locations_permissions
      .findOne({
        where: {
          user_id: user.user_id,
          location_id: locationData.id,
        },
      });
    if (!hasPermission) {
      permission.push(await database.locations_permissions
        .create({
          location_id: locationData.id,
          company_id: companyId,
          user_id: user.user_id,
          created_by: user.user_id,
          updated_by: user.user_id,
          role: user.role,
        }));
      console.info('>>>>>>>>>>>>>', hasPermission, permission);
    }
  });
  return permission;
}
