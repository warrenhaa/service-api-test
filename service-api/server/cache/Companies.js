import Logger from '../utils/Logger';
import database from '../models';
import { getOneFromCache, setInCache } from './Cache';
import ErrorCodes from '../errors/ErrorCodes';

async function getCompany(company_id, code) {
  return new Promise(async (resolve, reject) => {
   // add cache logic here
    let company = null;
    let where = {};
    // where condition based on company_id or company_code
    where = (company_id) ? { id: company_id } : { code: code };
    if (company_id) {
      company = await getOneFromCache("Companies", company_id);
    }
    if (code) {
      company = await getOneFromCache("Companies", code);
    }
    // if cache data found use that else set once
    if (!company) {
      // add here the set cache logic
      company = await database.companies.findOne({
        include: [
          {
            model: database.addresses,
          },
        ],
        where: where,
        order: [
          [database.addresses, 'created_at', 'asc'],
        ]
      });
      if (!company) {
        Logger.info("Info-Error", { "message": "company_id or code is wrong, not found company_id or code in postgres db.", value: (company_id)? company_id : code })
        const err = ErrorCodes['000001']; // company not found
        reject(err);
      }
      // set in cache
      if (company_id) {
        console.log("🚀 ~ file: Companies.js:38 ~ returnnewPromise ~ company_id:", company_id)
        await setInCache("Companies", company_id, company);
        company = await getOneFromCache("Companies", company_id);
      }
      if (code) {
        console.log("🚀 ~ file: Companies.js:56 ~ returnnewPromise ~ code:", code)
        await setInCache("Companies", code, company);
        company = await getOneFromCache("Companies", code);
      }
    }
    resolve(company ? company : null);
  });
}

module.exports = { getCompany };