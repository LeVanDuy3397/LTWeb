const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoomHistory = sequelize.define('RoomHistory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  roomId: { type: DataTypes.INTEGER, allowNull: false },
  temperature: { type: DataTypes.FLOAT, allowNull: false },
  humidity: { type: DataTypes.FLOAT, allowNull: false },
  status_led: { type: DataTypes.BOOLEAN, allowNull: false },
  status_fan: { type: DataTypes.BOOLEAN, allowNull: false },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
});

module.exports = RoomHistory;
