import Util from '../../utils/Utils';
import ErrorCodes from '../../errors/ErrorCodes';
import { getCompany } from '../../cache/Companies';
const util = new Util();

async function getCompanyIdFromCode(req, res, next) {0
  let companyId = null;
  const company = await getCompany(null, req.headers['x-company-code']).then(result => {
      return (result);  
    }).catch((error) => {
      const err = ErrorCodes['000001']; // company not found
      return util.sendError(req, res, err);
    });    
    if (!company) {
      const err = ErrorCodes['000001']; // company not found
      return util.sendError(req, res, err);
    }    
    companyId = company.id;   
  if (companyId && typeof (companyId) === 'string') {
    req.body.company_id = companyId;
    next();
  } else {
    const error = ErrorCodes['000001'];
    return util.sendError(req, res, error);
  }
}

export default getCompanyIdFromCode;
