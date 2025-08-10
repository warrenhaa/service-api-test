import InvitationService from '../services/InvitationService';
import Util from '../../utils/Utils';
import ErrorCodes from '../../errors/ErrorCodes';
import ApplicationError from '../../errors/ApplicationError';
import UsersService from '../services/UsersService';
import UserInvitationStatus from '../../utils/constants/UserInvitationStatus';

const util = new Util();
class InvitationController {
  static async getAllInvitations(req, res) {
    const invitations = await InvitationService.getAllInvitations(req);
    if (invitations.length > 0) {
      util.setSuccess(200, invitations);
    } else {
      const err = ErrorCodes['200000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async createInvitation(req, res) {
    if (req.body.email == req.userDetails.email) {
      const err = ErrorCodes['200009'];
      throw new ApplicationError(err);
    }
    const user = await UsersService.getUserByEmail(req.body.email);
    if (user) {
      const err = ErrorCodes['200001'];
      throw new ApplicationError(err);
    }
    // check condition email should not present in user_invitation table
    const invite = await InvitationService.addInvitation(
      req,
      req.userDetails,
    ).catch(() => {
      const err = ErrorCodes['200001'];
      throw new ApplicationError(err);
    });
    const inviteDetails = await InvitationService.getInvite(invite.id)
      .catch((error) => {
        const err = ErrorCodes['200001'];
        // console.log('422 error', error);
        throw new ApplicationError(err);
      });
    const event = 'createInvitation';
    // triggerRules(event, inviteDetails);
    util.setSuccess(200, invite);
    return util.send(req, res);
  }

  static async expireInvitation(req, res) {
    const alteredInvite = { status: UserInvitationStatus.EXPIRED };
    const { id } = req.params;
    const updateInvite = await InvitationService.expireInvitation(
      id,
      alteredInvite,
      req,
    );
    if (!updateInvite) {
      const err = ErrorCodes['200002'];
      throw new ApplicationError(err);
    } else {
      util.setSuccess(200, updateInvite);
    }
    return util.send(req, res);
  }

  static async expireInvitations(req, res) {
    const expireInvites = await InvitationService.expireInvitations(req);
    if (!expireInvites) {
      util.setSuccess(200, []);
    } else {
      util.setSuccess(200, expireInvites);
    }
    return util.send(req, res);
  }

  static async acceptInvitation(req, res) {
    const alteredInvite = { status: UserInvitationStatus.ACCEPTED, expires_at: null };
    const { id } = req.params;
    const updateInvite = await InvitationService.acceptInvitation(id, alteredInvite, req);
    if (!updateInvite) {
      const err = ErrorCodes['200003'];
      throw new ApplicationError(err);
    } else {
      util.setSuccess(200, updateInvite);
    }
    return util.send(req, res);
  }

  static async deleteInvitation(req, res) {
    const { id } = req.params;
    const inviteToDelete = await InvitationService.deleteInvite(id, req);
    if (inviteToDelete) {
      util.setSuccess(200);
    } else {
      const err = ErrorCodes['200004'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async resendInvitation(req, res) {
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const alteredInvite = { status: UserInvitationStatus.RESENT, expires_at: expiryDate };
    const { id } = req.params;
    const updateInvite = await InvitationService.resendInvite(
      id,
      alteredInvite,
      req,
    );
    if (!updateInvite) {
      const err = ErrorCodes['200005'];
      throw new ApplicationError(err);
    } else {
      const inviteDetails = await InvitationService.getInvite(id)
        .catch(() => {
          const err = ErrorCodes['200001'];
          throw new ApplicationError(err);
        });
      // const event = 'createInvitation';
      // triggerRules(event, inviteDetails);
      util.setSuccess(200, updateInvite);
    }
    return util.send(req, res);
  }

  static async editInvitationPermission(req, res) {
    const { id } = req.params;
    const alteredPermission = req.body.permissions;
    const updateInvite = await InvitationService.editInvitationPermission(id, alteredPermission, req);
    if (updateInvite.error) {
      if (updateInvite.error === 'NOT_FOUND') {
        const err = ErrorCodes['200007'];
        throw new ApplicationError(err);
      } else {
        const err = ErrorCodes['200008'];
        throw new ApplicationError(err);
      }
    } else {
      util.setSuccess(200, updateInvite);
    }
    return util.send(req, res);
  }

  static async getInvitationStatus(req, res) {
    const status = await InvitationService.getInvitationStatus(req);
    if (status) {
      util.setSuccess(200, status);
    } else {
      const err = ErrorCodes['200000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }

  static async getInviteDetailsByEmail(req, res) {
    const invite = await InvitationService.getInviteDetailsByEmail(req);
    if (invite) {
      util.setSuccess(200, invite.id);
    } else {
      const err = ErrorCodes['200000'];
      throw new ApplicationError(err);
    }
    return util.send(req, res);
  }
}

export default InvitationController;
