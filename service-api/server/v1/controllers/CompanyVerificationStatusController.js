import CompanyStatusService from '../services/CompanyStatusService';
import Util from '../../utils/Utils';

const util = new Util();

class CompanyVerificationStatusController {
  static async getCompanyVerificationStatus(req, res) {
    const status = await CompanyStatusService.getCompanyVerificationStatus(req.params);
    util.setSuccess(200, status);
    return util.send(req, res);
  }

  static async getAllCompanyVerificationStatus(req, res) {
    const status = await CompanyStatusService.getAllCompanyVerificationStatus();
    util.setSuccess(200, status);
    return util.send(req, res);
  }
}
export default CompanyVerificationStatusController;
