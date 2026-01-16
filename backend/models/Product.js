// Libraries
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accValue: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  discount: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mrp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'General'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  points: {
    type: DataTypes.JSON,
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'products',
  timestamps: true
});

module.exports = Product;