const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  ip: { type: DataTypes.STRING, allowNull: false, unique: true },
  status_led: { type: DataTypes.BOOLEAN, defaultValue: false }, // true: on, false: off
  status_fan: { type: DataTypes.BOOLEAN, defaultValue: false }, // true: on, false: off
  is_online: { type: DataTypes.BOOLEAN, defaultValue: false }, // true: online, false: offline
  allowFan_control: { type: DataTypes.BOOLEAN, defaultValue: false }, // true: allowed, false: not allowed
  humidityEncryption: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: false,
      method: null
    }
  }
});

module.exports = Room;
