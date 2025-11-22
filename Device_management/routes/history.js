const express = require('express');
const router = express.Router();
const RoomHistory = require('../models/RoomHistory');
const Room = require('../models/Room');
const { checkAllRoomsStatus } = require('../utils/deviceControl');

// History page - show all rooms
router.get('/', async (req, res) => {
  const rooms = await Room.findAll();
  // Check online status for all rooms
  await checkAllRoomsStatus(rooms);
  res.render('history_all', { rooms });
});

// History page for a specific room
router.get('/:roomId', async (req, res) => {
  const room = await Room.findByPk(req.params.roomId);
  const history = await RoomHistory.findAll({
    where: { roomId: room.id },
    order: [['createdAt', 'DESC']],
    limit: 100
  });
  res.render('history', { room, history });
});

module.exports = router;
