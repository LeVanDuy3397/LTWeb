const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const RoomHistory = require('../models/RoomHistory');
const { checkAllRoomsStatus } = require('../utils/deviceControl');
const crypto = require('crypto');
const SIMPLE_KEY = '165743'; // khóa cố định
// Dashboard page
router.get('/', async (req, res) => {
  const rooms = await Room.findAll();
  // Check online status for all rooms
  console.log('đã đếnn đâyyyyyyy');
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
  const is_online = await pingIP(room.ip);
  room.is_online = is_online;
  await room.save();
  
  const allowFan_control = room.allowFan_control;
  const humidityEncryption  = room.humidityEncryption;

  const history = await RoomHistory.findAll({
    where: { roomId: room.id },
    order: [['createdAt', 'DESC']],
    limit: 30
  });
  
  // Tạo AES key 32 bytes từ key đơn giản (giống ESP32)
  function generateKey(password) {
    return crypto.createHash('sha256').update(password).digest();
  }
  
  // Giải mã AES-256-CBC
  function decryptAES(encryptedBase64) {
    try {
      // Tạo key và IV (phải giống ESP32)
      const key = generateKey(SIMPLE_KEY);
      const iv = Buffer.alloc(16);
      for(let i = 0; i < 16; i++) iv[i] = i;
      
      // Decode Base64
      const encrypted = Buffer.from(encryptedBase64, 'base64');
      
      // Giải mã
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      decipher.setAutoPadding(true);
      
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
    } catch(error) {
      console.error('Lỗi giải mã:', error.message);
      return null;
    }
  }

  res.render('room_detail', { room, history, allowFan_control, humidityEncryption, decryptAES });
});

module.exports = router;
