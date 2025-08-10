import database from '../../models';
import ActivityLogs from '../helpers/ActivityUtils';
import Entities from '../../utils/constants/Entities';
import ErrorCodes from '../../errors/ErrorCodes';
import lodash from 'lodash';
import { getCompany } from '../../cache/Companies';
const { Op, QueryTypes } = database.Sequelize;

class OccupantsDashboardAttributesService {
  
  static async getlinkedCompanies(company_id) {
    // get company data from cache if not present set
    const company = await getCompany(company_id).then(result => {
      return (result);  
    }).catch((error) => {
      throw (error);
    });    
    if (!company) {
      const err = ErrorCodes['000001']; // company not found
      throw err;
    }
    let linkedCompanies = [];
    if (company.linked_companies) {
      linkedCompanies = company.linked_companies.split(',');
    }
    linkedCompanies.push(company.code);
    const companies = await database.companies.findAll({
      where: { code: { [Op.in]: linkedCompanies } },
    });
    linkedCompanies = lodash.map(companies, 'id');
    return linkedCompanies;
  }

  static async getOccupantsDashboardAttributes(id, occupant_id, company_id, item_id, type) {
    const linkedCompanies = await this.getlinkedCompanies(company_id)
    .catch((error) => {
      throw (error);
    }); 
    const where = { occupant_id, company_id: { [Op.in]: linkedCompanies } };
    if (!id) {
      where.item_id = item_id;
    } else {
      where.id = id;
    }
    if(type){
      where.type = type;
    }
    const getData = await database.occupants_dashboard_attributes.findOne({
      attributes: ['id', 'type', 'grid_order'],
      where,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160025'];
      throw err;
    });
    return getData;
  }

  static async getAllOccupantsDashboardAttributes(occupant_id, companyid, req) {
    const { item_id } = req.query;
    let where = {};
    const linkedCompanies = await this.getlinkedCompanies(companyid)
    .catch((error) => {
      throw (error);
    }); 
    where = {
      item_id, occupant_id, company_id: { code: { [Op.in]: linkedCompanies } },
    };
    const getData = await database.occupants_dashboard_attributes.findAll({ where })
      .then((result) => result).catch(() => {
        const err = ErrorCodes['160025'];
        throw new ApplicationError(err);
      });
    return getData;
  }

  static async AddorUpdateOccupantsDashboardAttributes(body, company_id, occupant_id) {
    const { item_id, type, grid_order } = body;
    const dashboardAttributeObj = {
      item_id, type, grid_order, occupant_id, company_id,
    }; 
    // run distinct type query on occupants dashboard attributes
    const distictTypeQuery = `SELECT DISTINCT type FROM occupants_dashboard_attributes`;
    var existingTypes = await database.sequelize.query(distictTypeQuery, {
      raw: true,
      logging: console.log,
    });
    existingTypes = existingTypes[0];
    const existingTypesArray = existingTypes.map((item) => item.type);
    
    // check type exists or not
    if (existingTypesArray && existingTypesArray.length > 0) {
       if (!existingTypesArray.includes(type)) {
        const err = ErrorCodes['160067']; // type not exists
        reject(err);
      }
    } else {  // types not present
      const err = ErrorCodes['160067']; // type not exists
      reject(err);
    }

    const dashboardAttributes = await this.getOccupantsDashboardAttributes(null, occupant_id, company_id, item_id, type);
    if (!dashboardAttributes) {
      const addDashboardAttributes = await database.occupants_dashboard_attributes.create(dashboardAttributeObj)
        .catch((err) => {
          console.log(err);
          err = ErrorCodes['160034'];
          throw err;
        });
      const Obj = {
        old: {},
        new: addDashboardAttributes,
      };
      ActivityLogs.addActivityLog(Entities.occupants_dashboard_attributes.entity_name, Entities.occupants_dashboard_attributes.event_name.added,
        Obj, Entities.notes.event_name.added, occupant_id, addDashboardAttributes.company_id, null, occupant_id, null);
      const dashboardAttributes = await this.getOccupantsDashboardAttributes(null, occupant_id, company_id, item_id, type);
      return dashboardAttributes;
    }
    const updateDashboardAttributes = await database.occupants_dashboard_attributes.update(
      { grid_order },
      {
        where: {
          item_id, type, company_id, occupant_id,
        },
        returning: true,
      },
    ).catch((error) => {
      const err = ErrorCodes['160037'];
      throw err;
    });
    const oldObj = { grid_order: dashboardAttributes.grid_order };
    const newObj = { grid_order };
    const obj = {
      old: oldObj,
      new: newObj,
    };
    ActivityLogs.addActivityLog(Entities.occupants_dashboard_attributes.entity_name, Entities.occupants_dashboard_attributes.event_name.updated,
      obj, Entities.notes.event_name.updated, occupant_id, company_id, null, occupant_id, null);
    const dashboardAttributesobj = await this.getOccupantsDashboardAttributes(null, occupant_id, company_id, item_id, type);
    return dashboardAttributesobj;
  }

  static async updateOccupantsDashboardAttributes(id, body, occupant_id, companyId) {
    const existingData = await this.getOccupantsDashboardAttributes(id, occupant_id, companyId);
    let afterUpdate = null;
    if (!existingData) {
      const err = ErrorCodes['160025'];
      throw err;
    }
    const updatedData = await database.occupants_dashboard_attributes.update({ grid_order: body.grid_order }, {
      where: { id, occupant_id },
      returning: true,
      raw: true,
    }).then((result) => result).catch(() => {
      const err = ErrorCodes['160037'];
      throw err;
    });
    afterUpdate = await this.getOccupantsDashboardAttributes(id, occupant_id, companyId).then((result) => result).catch(() => {
      const err = ErrorCodes['160040'];
      throw err;
    });
    console.log('afterUpdate', existingData);
    const oldObj = { grid_order: existingData.grid_order };
    const newObj = { grid_order: body.grid_order };
    const obj = {
      old: oldObj,
      new: newObj,
    };

    // if (JSON.stringify(deletedExistingData) !== JSON.stringify(deletedAfterUpdate)) {
    ActivityLogs.addActivityLog(Entities.occupants_dashboard_attributes.entity_name, Entities.occupants_dashboard_attributes.event_name.updated,
      obj, Entities.notes.event_name.updated, occupant_id, companyId, null, occupant_id, null);
    // }
    return afterUpdate;
  }

  static async deleteOccupantsDashboardAttributes(id, occupant_id, company_id, item_id) {
    let where = {};
    if(item_id){
      where = {item_id, occupant_id}
    }else{
      where= { id, occupant_id }
    }
    const deleteData = await database.occupants_dashboard_attributes.findOne({
      attributes: ['id', 'type', 'grid_order'],
      where,
    }).catch((error) => {
      const err = ErrorCodes['160025'];
      throw err;
    });
    if (!deleteData) {
      const err = ErrorCodes['160025'];
      throw err;
    }
    const deletedData = await database.occupants_dashboard_attributes.destroy({
           where,
    }).then((result) => result).catch((error) => {
      console.log(error);
      const err = ErrorCodes['160041'];
      throw err;
    });

    const obj = {
      old: deleteData,
      new: {},
    };
    ActivityLogs.addActivityLog(Entities.occupants_dashboard_attributes.entity_name, Entities.occupants_dashboard_attributes.event_name.deleted,
      obj, Entities.notes.event_name.deleted, occupant_id, company_id, null, occupant_id, null);
    return deletedData;
  }
}

export default OccupantsDashboardAttributesService;
