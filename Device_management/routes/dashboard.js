const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const RoomHistory = require('../models/RoomHistory');
const { checkAllRoomsStatus } = require('../utils/deviceControl');

// Dashboard page
router.get('/', async (req, res) => {
  const rooms = await Room.findAll();
  // Check online status for all rooms
  await checkAllRoomsStatus(rooms);
  res.render('dashboard', { rooms });
});

// Room detail (real-time handled by client)
router.get('/room/:id', async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) {
    req.flash('error_msg', 'Room not found');
    return res.redirect('/dashboard');
  }
  
  // Check if device is online
  const { pingIP } = require('../utils/deviceControl');
  const isOnline = await pingIP(room.ip);
  room.isOnline = isOnline;
  await room.save();
  
  const history = await RoomHistory.findAll({
    where: { roomId: room.id },
    order: [['createdAt', 'DESC']],
    limit: 30
  });
  res.render('room_detail', { room, history });
});

module.exports = router;
