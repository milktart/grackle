// schema.js
import { DataTypes } from "sequelize";

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
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
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
        type: DataTypes.TEXT, // Changed to TEXT for larger content
        allowNull: false,
      },
      raw: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    options: {
      indexes: [
        {
          fields: ["createdAt"], // Index for ordering by creation time
        }
      ]
    }
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
          unique: true,
          fields: ["city", "country"], // Prevent duplicate cities
        },
        {
          fields: ["latitude", "longitude"], // Index for location queries
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
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 12,
        }
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
      uvIndex: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: true,
        validate: {
          min: 0,
          max: 99, // UV Index typically ranges from 0-11+, with 15 being theoretical max
        }
      }
    },
    options: {
      indexes: [
        {
          unique: true,
          fields: ["cityId", "month"], // Prevent duplicate month data for same city
        },
        {
          fields: ["month"], // Index for month-based queries
        }
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
