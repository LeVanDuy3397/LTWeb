const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { pingIP, controlLed, controlFan, checkAllRoomsStatus, getData, toggle_encryption_and_method } = require('../utils/deviceControl');

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

// Toggle device status_led (on/off)
router.post('/toggle_led/:id', async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) {
    req.flash('error_msg', 'Room not found');
    return res.redirect('/dashboard/room/' + req.params.id);
  }

 // Check if device is online
  const is_online = await pingIP(room.ip);
  if (!is_online) {
    req.flash('error_msg', 'Thiết bị không online. Không thể điều khiển.');
    room.is_online = false;
    await room.save();
    return res.redirect('/dashboard/room/' + req.params.id);
  }
  
  // Toggle status_fan
  const newStatus = !room.status_led;
  
  // Try to control the device
  const success = await controlLed(room.ip, newStatus);
  
  if (success) {
    room.status_led = newStatus;
    room.is_online = true;
    await room.save();
    req.flash('success_msg', `Thiết bị đã ${newStatus ? 'bật' : 'tắt'} thành công`);
  } else {
    req.flash('error_msg', 'Không thể điều khiển thiết bị. Vui lòng thử lại.');
  }
  
  res.redirect('/dashboard/room/' + req.params.id);
});

// Toggle device status_fan (on/off)
router.post('/toggle_fan/:id', async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) {
    req.flash('error_msg', 'Room not found');
    return res.redirect('/dashboard/room/' + req.params.id);
  }

 // Check if device is online
  const is_online = await pingIP(room.ip);
  if (!is_online) {
    req.flash('error_msg', 'Thiết bị không online. Không thể điều khiển.');
    room.is_online = false;
    await room.save();
    return res.redirect('/dashboard/room/' + req.params.id);
  }
  
  // Toggle status_fan
  const newStatus = !room.status_fan;
  
  // Try to control the device
  const success = await controlFan(room.ip, newStatus);
  
  if (success) {
    room.status_fan = newStatus;
    room.is_online = true;
    await room.save();
    req.flash('success_msg', `Thiết bị đã ${newStatus ? 'bật' : 'tắt'} thành công`);
  } else {
    req.flash('error_msg', 'Không thể điều khiển thiết bị. Vui lòng thử lại.');
  }
  
  res.redirect('/dashboard/room/' + req.params.id);
});

router.post('/toggle_fan_permission/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { allowFan_control } = req.body;
    
    // Cập nhật database
    await Room.update(
      { allowFan_control: allowFan_control },
      { where: { id: roomId } }
    );
    
    res.json({ success: true, allowFan_control: allowFan_control });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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

// API: Get data from a room
router.get('/data_from_room/:id', async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Lấy dữ liệu cảm biến từ ESP32
    const Data = await getData(room.ip);
    
    if (Data) {
      res.json({
        success: true,
        roomId: room.id,
        roomName: room.name,
        ...Data
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

// Route: Bật/tắt mã hóa độ ẩm
router.post('/toggle_encryption/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { enabled } = req.body;

    // Tìm phòng trong database
    const room = await Room.findByPk(roomId);
    
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy phòng' 
      });
    }

    // Cập nhật trạng thái mã hóa
    await room.update({ 
      humidityEncryption: {
        ...room.humidityEncryption,
        method: null,
        enabled: enabled
      }
    });
    if (enabled==false){
      await toggle_encryption_and_method(room.ip, false, null); // sau khi lưu database thì gửi lệnh đến esp32 nếu tắt mã hóa
    }

    console.log(`🔐 Room ${roomId}: Encryption ${enabled ? 'enabled' : 'disabled'}`);
    res.json({ 
      success: true, 
      message: `Mã hóa đã ${enabled ? 'bật' : 'tắt'}`,
      data: {
        enabled: enabled
      }
    });

  } catch (error) {
    console.error('Error toggling encryption::::::', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Route: Chọn thuật toán mã hóa
router.post('/set_encryption_method/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { method } = req.body;

    // Validate thuật toán
    const validMethods = ['AES-256', 'DES'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thuật toán không hợp lệ' 
      });
    }

    const room = await Room.findByPk(roomId);
    
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy phòng' 
      });
    }

    // Kiểm tra xem mã hóa đã được bật chưa
    if (!room.humidityEncryption?.enabled) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng bật mã hóa trước' 
      });
    }

    // Cập nhật thuật toán
    await room.update({ 
      humidityEncryption: {
        enabled: true,
        method: method
      }
    });

    await toggle_encryption_and_method(room.ip, true, method); // sau khi lưu database thì gửi lệnh đến esp32
    
    console.log(`🔐 Room ${roomId}: Encryption method set to ${method}`);

    // Gửi lệnh đến ESP32 (nếu cần)
    // sendEncryptionCommandToESP32(roomId, method);

    res.json({ 
      success: true, 
      message: `Đã chọn thuật toán ${method}`,
      data: {
        method: method
      }
    });

  } catch (error) {
    console.error('Error setting encryption method:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

module.exports = router;
