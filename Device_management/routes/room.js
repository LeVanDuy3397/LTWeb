const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { pingIP, controlDevice, checkAllRoomsStatus, getSensorData } = require('../utils/deviceControl');

// Room management page
router.get('/', async (req, res) => {
  const rooms = await Room.findAll();
  // Check online status for all rooms
  await checkAllRoomsStatus(rooms);
  res.render('rooms', { rooms, errors: [] });
});

// Add new room
router.post('/add', async (req, res) => {
  const { name, ip } = req.body;
  let errors = [];
  if (!name || !ip) {
    errors.push({ msg: 'Please fill in all fields' });
    return res.render('rooms', { errors, rooms: await Room.findAll() });
  }
  try {
    await Room.create({ name, ip });
    req.flash('success_msg', 'Room added successfully');
    res.redirect('/rooms');
  } catch (err) {
    errors.push({ msg: 'Room IP must be unique or server error' });
    res.render('rooms', { errors, rooms: await Room.findAll() });
  }
});

// Toggle device status (on/off)
router.post('/toggle/:id', async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) {
    req.flash('error_msg', 'Room not found');
    return res.redirect('/dashboard/room/' + req.params.id);
  }
  
  // Check if device is online
  const isOnline = await pingIP(room.ip);
  if (!isOnline) {
    req.flash('error_msg', 'Thiết bị không online. Không thể điều khiển.');
    room.isOnline = false;
    await room.save();
    return res.redirect('/dashboard/room/' + req.params.id);
  }
  
  // Toggle status
  const newStatus = !room.status;
  
  // Try to control the device
  const success = await controlDevice(room.ip, newStatus);
  
  if (success) {
    room.status = newStatus;
    room.isOnline = true;
    await room.save();
    req.flash('success_msg', `Thiết bị đã ${newStatus ? 'bật' : 'tắt'} thành công`);
  } else {
    req.flash('error_msg', 'Không thể điều khiển thiết bị. Vui lòng thử lại.');
  }
  
  res.redirect('/dashboard/room/' + req.params.id);
});

// Edit room
router.post('/edit/:id', async (req, res) => {
  const { name, ip } = req.body;
  const room = await Room.findByPk(req.params.id);
  if (room) {
    room.name = name;
    room.ip = ip;
    await room.save();
    req.flash('success_msg', 'Room updated successfully');
  }
  res.redirect('/rooms');
});

// Delete room
router.post('/delete/:id', async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (room) {
    await room.destroy();
    req.flash('success_msg', 'Room deleted successfully');
  }
  res.redirect('/rooms');
});

// API: Get sensor data from a room
router.get('/sensor/:id', async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Lấy dữ liệu cảm biến từ ESP32
    const sensorData = await getSensorData(room.ip);
    
    if (sensorData) {
      res.json({
        success: true,
        roomId: room.id,
        roomName: room.name,
        ...sensorData
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Cannot get sensor data from device'
      });
    }
  } catch (error) {
    console.error('Error getting sensor data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
