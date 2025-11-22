const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  ip: { type: DataTypes.STRING, allowNull: false, unique: true },
  status: { type: DataTypes.BOOLEAN, defaultValue: false }, // true: on, false: off
  isOnline: { type: DataTypes.BOOLEAN, defaultValue: false } // true: online, false: offline
});

module.exports = Room;
