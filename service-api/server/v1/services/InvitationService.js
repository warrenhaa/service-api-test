import { Op } from 'sequelize';
import lodash from 'lodash';
import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import paginate from '../../utils/Paginate';
import checkAllDeviceAccess from '../helpers/CheckAllDeviceAccess';
import UserInvitationStatus from '../../utils/constants/UserInvitationStatus';
import constants from '../../utils/constants/Responses';
import { getCompany } from '../../cache/Companies';
import ErrorCodes from '../../errors/ErrorCodes';

const moment = require('moment');

class InvitationService {
  static async getAllInvitations(req) {
    const params = req.query;
    const page = params.page || null;
    const pageSize = params.pageSize || null;
    const startDate = params.startDate || null;
    const endDate = params.endDate || null;
    const company = {};
    company.company_id = req.body.company_id;
    const query = { ...params, ...company };
    if (startDate && endDate) {
      query.event_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
    delete query.page;
    delete query.pageSize;
    delete query.startDate;
    delete query.endDate;
    if (!await checkAllDeviceAccess({ companyId: company.company_id, userId: req.user_id })) {
      query.created_by = req.userDetails.email;
    }
    const invitations = await database.user_invitations.findAll(
      paginate(
        {
          where: query,
          raw: true,
          nest: true,
        },
        { page, pageSize },
      ),
    );
    return invitations;
  }

  static async getInvite(id) {
    const invite = await database.user_invitations.findOne({
      include: [
        {
          model: database.companies,
          include: [
            {
              model: database.addresses,

            }],
        },
      ],
      order: [
        [database.companies, database.addresses, 'created_at', 'asc'],
      ],
      where: { id },
      raw: true,
      nest: true,
    }).catch((err) => {
      throw (err);
    });
    return invite;
  }

  static async addInvitation(req, userDetails) {
    const Day = process.env.USER_EXPIRE_AFTER_DAYS;
    const expiryDate = new Date(Date.now() + Day * 24 * 60 * 60 * 1000);
    const { body } = req;
    const invite = await database.user_invitations.create({
      email: body.email,
      created_by: userDetails.email,
      updated_by: userDetails.email,
      status: UserInvitationStatus.INVITED,
      expires_at: expiryDate,
      initial_permissions: body.permissions,
      company_id: body.company_id,
    }).catch((err) => {
      throw (err);
    });
    const inviter_email = userDetails.email;
    const invite_id = invite.id;
    const { email } = invite;
    let expires_at = moment(new Date(invite.expires_at)).utc().format(constants.datetimeconstant.date_time);
    expires_at += ' (UTC)';
    const companyDetails = await getCompany(body.company_id).then(result => {
      return (result);
    }).catch((error) => {
      console.log(error);
      throw (error);
    });
    if (!companyDetails) {
      const err = ErrorCodes['000001'];
      throw (err);
    } 
    const company_name = companyDetails.name;

    const placeholdersData = {
      email,
      inviter_email,
      company_name,
      expires_at,
      button_link: `${process.env.SERVICE_HOST}/signup?email=${encodeURIComponent(email)}&&invite_id=${invite_id}`,
      receiverList: [{ email }],
    };
    const obj = {
      old: {},
      new: invite,
    };
    if (invite) {
      ActivityLogs.addActivityLog(Entities.invitations.entity_name, Entities.invitations.event_name.added,
        obj, Entities.notes.event_name.added, invite.id, body.company_id, req.user_id, null, placeholdersData);
    }
    return invite;
  }

  static async deleteInvite(id, req) {
    const { body } = req;
    const inviteToDelete = await database.user_invitations.findOne({ where: { id } });
    if (inviteToDelete) {
      const deletedInvite = await database.user_invitations.destroy({
        where: { id },
      });
      if (deletedInvite) {
        inviteToDelete.created_by = req.user_id;
        const obj = {
          old: inviteToDelete,
          new: {},
        };
        ActivityLogs.addActivityLog(Entities.invitations.entity_name, Entities.invitations.event_name.deleted,
          obj, Entities.notes.event_name.deleted, inviteToDelete.id, body.company_id, req.user_id, null);
        return deletedInvite;
      }
    }
    return null;
  }

  static async expireInvitation(id, updateInvite, req) {
    let oldObj = {};
    let newObj = {};
    const inviteToUpdate = await database.user_invitations.findOne({
      where: { id },
    });
    const { body } = req;
    if (inviteToUpdate && inviteToUpdate.dataValues.status !== UserInvitationStatus.EXPIRED && inviteToUpdate.dataValues.status !== UserInvitationStatus.ACCEPTED
      && inviteToUpdate.dataValues.status !== UserInvitationStatus.CONFIRMED) {
      const expiredData = await database.user_invitations.update(updateInvite, {
        where: { id },
        returning: true,
        plain: true,
      });
      oldObj = {
        email: inviteToUpdate.dataValues.email,
        status: inviteToUpdate.dataValues.status,
      };
      newObj = {
        email: expiredData[1].dataValues.email,
        status: updateInvite.status,
      };
      const obj = {
        old: oldObj,
        new: newObj,
      };
      ActivityLogs.addActivityLog(Entities.invitations.entity_name, Entities.invitations.event_name.expired,
        obj, Entities.notes.event_name.updated, inviteToUpdate.id, body.company_id, req.user_id, null);
      return updateInvite;
    }
    return null;
  }

  static async expireInvitations(req) {
    const { body } = req;
    const expireInvitations = await database.user_invitations.update({ status: UserInvitationStatus.EXPIRED }, {
      where: {
        expires_at: {
          [Op.lte]: moment().toDate(),
        },
        status: {
          [Op.notIn]: [UserInvitationStatus.ACCEPTED, UserInvitationStatus.CONFIRMED, UserInvitationStatus.EXPIRED],
        },
      },
      returning: true,
    }).then((result) => {
      result[1].forEach((value) => {
        if (value) {
          const data = {
            email: value.email,
            status: value.status,
          };
          const obj = {
            old: {},
            new: data,
          };
          ActivityLogs.addActivityLog(Entities.invitations.entity_name, Entities.invitations.event_name.expired,
            obj, Entities.notes.event_name.updated, value.id, body.company_id, req.user_id, null);
        }
      }); return result;
    }).catch((err) => {
      throw (err);
    });
    return expireInvitations;
  }

  static async acceptInvitation(id, updateInvite, req) {
    let oldObj = {};
    let newObj = {};
    const { body } = req;
    const inviteToAccept = await database.user_invitations.findOne({
      where: { id },
    });
    if (inviteToAccept && inviteToAccept.dataValues.status !== UserInvitationStatus.EXPIRED
      && inviteToAccept.dataValues.status !== UserInvitationStatus.ACCEPTED
      && inviteToAccept.dataValues.status !== UserInvitationStatus.CONFIRMED) {
      const iniviteAccepted = await database.user_invitations.update(updateInvite, {
        where: { id },
        returning: true,
        plain: true,
      });
      oldObj = {
        status: inviteToAccept.dataValues.status,
        expires_at: inviteToAccept.dataValues.expires_at,
        email: inviteToAccept.dataValues.email,
      };
      newObj = {
        status: updateInvite.status,
        expires_at: updateInvite.expires_at,
        email: iniviteAccepted[1].dataValues.email,
      };
      const obj = {
        old: oldObj,
        new: newObj,
      };
      ActivityLogs.addActivityLog(Entities.invitations.entity_name, Entities.invitations.event_name.accepted,
        obj, Entities.notes.event_name.updated, inviteToAccept.id, body.company_id, body.company_id, null);
      const updatedInvite = await database.user_invitations.findOne({
        where: { id },
      });
      return updatedInvite;
    }
    return null;
  }

  static async resendInvite(id, updateInvite, req) {
    let oldObj = {};
    let newObj = {};
    const { userDetails } = req;
    const inviteToResend = await database.user_invitations.findOne({
      where: { id },
    });
    const { body } = req;
    if (inviteToResend
      && inviteToResend.dataValues.status !== UserInvitationStatus.ACCEPTED
      && inviteToResend.dataValues.status !== UserInvitationStatus.CONFIRMED) {
      const resentInvite = await database.user_invitations.update(updateInvite, {
        where: { id },
        returning: true,
        plain: true,
      });
      resentInvite[1].dataValues.created_by = req.user_id;
      const { email } = resentInvite[1].dataValues;
      const inviter_email = userDetails.email;
      const invite_id = id;
      let expires_at = moment(new Date(updateInvite.expires_at)).utc().format(constants.datetimeconstant.date_time);
      expires_at += ' (UTC)';
      // get company data from cache else set in cache 
      const companyDetails = await getCompany(body.company_id).then(result => {
        return (result);
      }).catch((error) => {
        console.log(error);
        throw (error);
      });
      if (!companyDetails) {
        const err = ErrorCodes['000001'];
        throw (err);
      } 
      const company_name = companyDetails.name;
      oldObj = {
        status: inviteToResend.dataValues.status,
        expires_at: inviteToResend.dataValues.expires_at,
        email: inviteToResend.dataValues.email,
      };
      newObj = {
        status: updateInvite.status,
        expires_at: updateInvite.expires_at,
        email,
      };
      const placeholdersData = {
        email,
        inviter_email,
        expires_at,
        company_name,
        button_link: `${process.env.SERVICE_HOST}/signup?email=${encodeURIComponent(email)}&&invite_id=${invite_id}`,
        receiverList: [{ email }],
      };
      const obj = {
        old: oldObj,
        new: newObj,
      };
      ActivityLogs.addActivityLog(Entities.invitations.entity_name, Entities.invitations.event_name.resent,
        obj, Entities.notes.event_name.updated, inviteToResend.id, body.company_id, req.user_id, null, placeholdersData);
      const updatedResend = await database.user_invitations.findOne({
        where: { id },
      });
      return updatedResend;
    }
    return null;
  }

  static async editInvitationPermission(id, updateInvite, req) {
    let oldObj = {};
    let newObj = {};
    const { body } = req;
    const inviteToEdit = await database.user_invitations.findOne({
      where: { id },
      plain: true,
    });
    if (!inviteToEdit) {
      return { error: 'NOT_FOUND' };
    }
    if (inviteToEdit.dataValues.status === UserInvitationStatus.ACCEPTED || inviteToEdit.dataValues.status === UserInvitationStatus.CONFIRMED) {
      // const obj = {};
      // ActivityLogs.addActivityLog(Entities.invitations.entity_name, Entities.invitations.event_name.edit_permissions_id_already_accepted,
      //   obj, Entities.notes.event_name.updated, inviteToEdit.id, body.company_id, req.user_id, null);
      return { error: 'ALREADY_ACCEPTED' };
    }
    if (inviteToEdit && inviteToEdit.dataValues.status !== UserInvitationStatus.ACCEPTED && inviteToEdit.dataValues.status !== UserInvitationStatus.CONFIRMED) {
      const mergedPermissions = lodash.merge({}, { initial_permissions: updateInvite },
        inviteToEdit.initial_permissions);
      await database.user_invitations.update(mergedPermissions, {
        where: { id },
        returning: true,
        plain: true,
      }).then(async (result) => {
        const data = lodash.get(result, '[0][1]', inviteToEdit).dataValues;
        oldObj = {
          email: inviteToEdit.email,
          initial_permissions: inviteToEdit.initial_permissions,
        };
        newObj = {
          email: result[1].dataValues.email,
          updated_permissions: result[1].dataValues.initial_permissions,
        };

        const obj = {
          old: oldObj,
          new: newObj,
        };
        ActivityLogs.addActivityLog(Entities.invitations.entity_name, Entities.invitations.event_name.edit_permissions,
          obj, Entities.notes.event_name.updated, inviteToEdit.id, body.company_id, req.user_id, null);
        return data;
      });
      const updatedInvite = await database.user_invitations.findOne({
        where: { id },
      });
      return updatedInvite;
    }
    return null;
  }

  static async getInvitationStatus(req) {
    const { id } = req.params;
    const invite = await database
      .user_invitations.findOne({
        where: { id },
        raw: true,
        attributes: ['status'],
      });
    return invite;
  }

  static async getInviteDetailsByEmail(req) {
    const { email } = req.query;
    const invite = await database
      .user_invitations.findOne({
        where: { email },
        raw: true,
      });
    return invite;
  }

  static async confirmInvite(id, userId, companyId, req) {
    let oldObj = {};
    let newObj = {};
    const invite = await database.user_invitations.findOne({
      where: { id },
    });
    if (invite) {
      const confirmedInvite = await database.user_invitations.update({
        status: UserInvitationStatus.CONFIRMED,
        expires_at: null,
      }, {
        where: { id },
        returning: true,
        plain: true,
      }).catch((err) => {
        throw (err);
      });
      oldObj = {
        status: invite.dataValues.status,
        email: invite.dataValues.email,
      };
      newObj = {
        status: confirmedInvite[1].dataValues.status,
        email: confirmedInvite[1].dataValues.email,
      };
      const obj = {
        old: oldObj,
        new: newObj,
      };
      ActivityLogs.addActivityLog(Entities.invitations.entity_name, Entities.invitations.event_name.confirmed,
        obj, Entities.notes.event_name.updated, invite.id, companyId, req.user_id, null);
      return confirmedInvite;
    }
    return null;
  }
}

export default InvitationService;
