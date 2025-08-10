import { Sequelize, DataTypes } from "sequelize";

// define a new table 'users'
export const schema = {
  Admin: {
    attributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
      allowNull: false,
    },
},
  },
  Permissions: {
    attributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    attribute: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attributeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    allow: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },},
  },
  Logs: {
    attributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    raw: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },},
  },
  Cities: {
    attributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: false,
    },
},
    options: {
      indexes: [
        {
          unique: false,
          fields: ["city", "country"],
        }
      ]
    },
    associations: [
      {
        type: "hasMany",
        target: "Climate",
        foreignKey: "cityId",
        onDelete: "CASCADE",
      },
    ],
  },
  Climate: {
     attributes: {
     id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    cityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER, // 1-12
      allowNull: false,
    },
    avgHighTemp: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    avgLowTemp: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    avgRainfallmm: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    avgRainDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    avgSunshineHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    specialEvents: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    visit_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
},
    options: {
      indexes: [
        {
          unique: false,
          fields: ["cityId", "month"],
        },
        {
          unique: false,
          fields: ["visit_score"],
        },
      ],
    },
    associations: [
      {
        type: "belongsTo",
        target: "Cities",
        foreignKey: "cityId",
      },
    ],
  }
};

//export default schema;
