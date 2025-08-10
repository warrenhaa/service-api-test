import lodash from 'lodash';
import CacheKeys from './Constants';
import redisClient from './redisClient';

redisClient.on('connect', () => {
  console.info('Redis Connected cache.js'); //
});

async function setInCache(cacheKey, id, valueMappings, expireAfter) {
  await redisClient.hmset(
    `${cacheKey}`,
    `${id}`,
    JSON.stringify(valueMappings),
  );
  if (expireAfter) {
    redisClient.expire(`${cacheKey}`, expireAfter);
  } else {
    redisClient.expire(`${cacheKey}`, 7776000);
  }
}

async function getAllFromCache(cacheKey) {
  let data = null;
  await redisClient.hgetall(`${cacheKey}`, (error, cachedData) => {
    data = [];

    if (error) {
      data = null;
    }
    if (cachedData != null) {
      Object.keys(cachedData).forEach((key) => {
        data.push(JSON.parse(cachedData[key]));
      });
    }
    return data;
  });
  return data;
}

async function deleteFromCache(cacheKey, id) {
  await redisClient.hdel(`${cacheKey}`, `${id}`);
}

async function getOneFromCache(cacheKey, id) {
  let dataValues = null;
  await redisClient.hget(`${cacheKey}`, `${id}`, (error, cachedData) => {
    if (error) {
      dataValues = null;
    }
    if (cachedData != null) {
      dataValues = JSON.parse(cachedData);
    }
  });
  return dataValues;
}

async function getLocationsFromCache(req) {
  let data = null;
  const id = req.body.company_id;
  const containerId = req.query.container_id || null;
  await redisClient.hgetall(CacheKeys.LOCATIONS, (error, cachedData) => {
    data = [];

    if (error) {
      data = null;
    }
    if (cachedData != null) {
      Object.keys(cachedData).forEach((key) => {
        const companyId = JSON.parse(cachedData[key]).company_id;
        const containerIdFromCache = JSON.parse(cachedData[key]).container_id;
        if (companyId === id) {
          if (containerId) {
            if (containerIdFromCache === containerId) {
              data.push(JSON.parse(cachedData[key]));
            }
          } else {
            data.push(JSON.parse(cachedData[key]));
          }
        }
      });
    }
    return data;
  });
  return data;
}

async function getLocationTypesFromCache(req) {
  let data = null;
  const id = req.body.company_id;
  await redisClient.hgetall(CacheKeys.LOCATION_TYPES, (error, cachedData) => {
    data = [];

    if (error) {
      data = null;
    }
    if (cachedData != null) {
      Object.keys(cachedData).forEach((key) => {
        const companyId = JSON.parse(cachedData[key]).company_id;
        if (companyId === id) {
          data.push(JSON.parse(cachedData[key]));
        }
      });
    }
    return data;
  });
  return data;
}

async function setCompaniesCodeMapToCache(companies) {
  const { code } = companies;
  const companyId = companies.id;
  await redisClient.hmset(CacheKeys.COMPANY_CODES, code, companyId);
  redisClient.expire(CacheKeys.COMPANY_CODES, 7776000);
}

async function getCompanyCodeFromCache(code) {
  const companyId = await redisClient.hget(CacheKeys.COMPANY_CODES, code);
  return companyId;
}

async function setActivityConfigsOfCompany(companyId, entity, data) {
  await redisClient.hmset(
    `${CacheKeys.ACTIVITY_CONFIGS}`, `${companyId}:${entity}`,
    JSON.stringify(data),
  );
  redisClient.expire(`${CacheKeys.ACTIVITY_CONFIGS}`, 7776000);
}

async function getActivityConfigsOfCompany(companyId, entity) {
  const configs = await redisClient.hget(`${CacheKeys.ACTIVITY_CONFIGS}`, `${companyId}:${entity}`);
  return configs ? JSON.parse(configs) : null;
}

async function getAllDevicesOfLocationFromCache(req) {
  let data = null;
  const companyId = req.body.company_id;
  const locationId = req.params.id;
  await redisClient.hgetall(CacheKeys.DEVICES, (error, cachedData) => {
    data = [];

    if (error) {
      data = null;
    }
    if (cachedData != null) {
      const allDevices = Object.values(cachedData).map((value) => JSON.parse(value));
      const devicesOfCompany = lodash.filter(allDevices, [
        'company_id',
        companyId,
      ]);
      data = lodash.filter(devicesOfCompany, [
        'location_id',
        locationId,
      ]);
    }
    return data;
  });
  return data;
}

export {
  setInCache,
  deleteFromCache,
  getOneFromCache,
  getAllFromCache,
  getLocationsFromCache,
  getLocationTypesFromCache,
  getCompanyCodeFromCache,
  setCompaniesCodeMapToCache,
  setActivityConfigsOfCompany,
  getActivityConfigsOfCompany,
  getAllDevicesOfLocationFromCache,
};
