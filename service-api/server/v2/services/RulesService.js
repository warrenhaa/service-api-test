// import database from '../../models';

// class RulesService {
//   static async getAllRules() {
//     const rules = await database.rules_engine.findAll({});
//     //   .map((el) => el.get({ plain: true }));
//     return rules;
//   }

//   static async getRule() {
//     // const rule = await database.rules_engine.findOne({ name: ruleName });
//     return null;
//   }

//   static async addRule(body) {
//     const rule = await database.rules_engine.create({
//       name: body.name,
//       rules: body.rules,
//     });
//     return rule;
//   }

//   static async deleteRule(id) {
//     const ruleToDelete = await database.rules_engine.findOne({ where: { id } });
//     if (ruleToDelete) {
//       const deletedRule = await database.rules_engine.destroy({
//         where: { id },
//       });
//       return deletedRule;
//     }
//     return null;
//   }
// }

// export default RulesService;
