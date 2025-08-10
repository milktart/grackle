// models.js
import { schema } from "./schema.js";
import { Sequelize } from "sequelize";

export function initModels(sequelize) {
  const models = {};

  // Create models from schema
  for (const [name, def] of Object.entries(schema)) {
    models[name] = sequelize.define(name, def.attributes, def.options || {});
  }

  // Set up associations
  for (const [name, def] of Object.entries(schema)) {
    if (def.associations) {
      def.associations.forEach((assoc) => {
        models[name][assoc.type](
          models[assoc.target],
          {
            foreignKey: assoc.foreignKey,
            onDelete: assoc.onDelete,
          }
        );
      });
    }
  }

  return models;
}
