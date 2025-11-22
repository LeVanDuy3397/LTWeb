const sequelize = require('./config/database');
const User = require('./models/User');
const Room = require('./models/Room');
const RoomHistory = require('./models/RoomHistory');

(async () => {
  try {
    await sequelize.sync({ alter: true });
    await User.sync();
    await Room.sync();
    await RoomHistory.sync();
    console.log('Database synced');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing database:', err);
    process.exit(1);
  }
})();
