// Libraries
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tokens: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Instance method for generating auth token
User.prototype.generateAuthToken = async function() {
  try {
    const token = jwt.sign({ id: this.id }, process.env.SECRET_KEY);
    // Clone the array to ensure Sequelize detects the change
    const tokens = JSON.parse(JSON.stringify(this.tokens || []));
    tokens.push({ token });
    this.tokens = tokens;
    // Mark the field as changed for Sequelize to detect
    this.changed('tokens', true);
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = User;
