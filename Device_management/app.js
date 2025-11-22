require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('./passport-setup');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const roomRoutes = require('./routes/room');
const historyRoutes = require('./routes/history');

// Redirect root to /login (always)
app.get('/', (req, res) => {
  return res.redirect('/login');
});

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/rooms', roomRoutes);
app.use('/history', historyRoutes);

// TEST: Xem tất cả rooms trong database
app.get('/api/test/rooms', async (req, res) => {
  const Room = require('./models/Room');
  const rooms = await Room.findAll();
  res.json({ count: rooms.length, rooms });
});

// API để ESP32 gửi dữ liệu cảm biến (nếu ESP32 chủ động gửi)
app.post('/api/sensor-data', async (req, res) => {
  try {
    const { ip, temperature, timestamp, humidity } = req.body;
    
    console.log(`[Sensor Data] Received from ${ip}: Temp=${temperature}°C, Humidity=${humidity}%`);
    console.log(`[Sensor Data] Kiểu dữ liệu nhiệt độ: ${typeof temperature}, kiểu dữ liệu độ ẩm: ${typeof humidity}`);

    // Tìm room theo IP - linh hoạt với mọi dạng IP
    const Room = require('./models/Room');
    const RoomHistory = require('./models/RoomHistory');
    const { Op } = require('sequelize');
    
    let room = null;
    
    // Bước 1: Thử khớp chính xác IP
    room = await Room.findOne({ where: { ip } });
    
    // Bước 2: Nếu không tìm thấy, thử khớp theo PORT (bỏ qua host)
    if (!room && ip.includes(':')) {
      const requestPort = ip.split(':')[1];
      const allRooms = await Room.findAll();
      
      // Tìm room có cùng port (bất kể host là gì)
      room = allRooms.find(r => {
        if (r.ip.includes(':')) {
          const roomPort = r.ip.split(':')[1];
          return roomPort === requestPort;
        }
        return false;
      });
      
      if (room) {
        console.log(`[Sensor Data] ✓ Matched by PORT: Request=${ip} <-> Database=${room.ip}`);
      }
    }
    
    console.log(`[Sensor Data] Looking for room with IP: ${ip}`);
    console.log(`[Sensor Data] Room found:`, room ? `${room.name} (ID: ${room.id}, IP: ${room.ip})` : 'NULL - NOT FOUND');
    
    if (room) {
      // Lưu vào RoomHistory - gồm nhiệt độ, độ ẩm và trạng thái hiện tại
      try {
        await RoomHistory.create({
          roomId: room.id,
          temperature: parseFloat(temperature),
          humidity: parseFloat(humidity),
          status: room.status, // Lưu trạng thái hiện tại của thiết bị
          createdAt: timestamp || new Date()
        });
      } catch (saveError) {
        console.error(`[Sensor Data] Error saving to RoomHistory for room ${room.name}:`, saveError);
      }
      
      console.log(`[Sensor Data] ✓ Saved to RoomHistory for room: ${room.name}`);
      
      // Broadcast dữ liệu qua Socket.IO cho dashboard real-time
      io.emit('sensorUpdate', {
        roomId: room.id,
        roomName: room.name,
        temperature,
        humidity,
        status: room.status, // Gửi trạng thái thiết bị để hiển thị realtime
        isOnline: room.isOnline, // Gửi trạng thái online/offline
        timestamp
      });
      
      console.log(`[Sensor Data] ✓ Broadcasted to clients`);
    }
    
    res.json({ success: true, message: 'Sensor data received' });
  } catch (error) {
    console.error('[Sensor Data] Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('A user connected');
  // ... handle real-time events ...
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Background job: Poll sensor data từ ESP32 mỗi 5 giây, tức cả khi ESP32 không chủ động gửi
const { getSensorData } = require('./utils/deviceControl');
const Room = require('./models/Room');
const RoomHistory = require('./models/RoomHistory');

setInterval(async () => {
  try {
    const rooms = await Room.findAll({ where: { isOnline: true } });
    
    for (const room of rooms) {
      const sensorData = await getSensorData(room.ip); // đây là chỗ server mỗi 5s sẽ lên
      // đường dẫn http://<room.ip>/sensor để lấy dữ liệu cảm biến rồi hiển thị và lưu
      console.log(`[Polling] Fetched data from ${room.name} (${room.ip}):`, sensorData);
        // Lưu vào database
       try {
          await RoomHistory.create({
            roomId: room.id,
            temperature: parseFloat(sensorData.temperature),
            humidity: parseFloat(sensorData.humidity),
            status: room.status,
            createdAt: new Date()
        });
        } catch (saveError) {
          console.error(`[Polling] Error saving data for ${room.name}:`, saveError);
        }
        
        // Broadcast realtime
        io.emit('sensorUpdate', {
          roomId: room.id,
          roomName: room.name,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          status: room.status,
          isOnline: room.isOnline,
          timestamp: new Date()
        });
        
        console.log(`[Polling] Room ${room.name}: ${sensorData.temperature}°C, ${sensorData.humidity}%, Status: ${room.status ? 'ON' : 'OFF'}`);
    }
  } catch (error) {
    console.error('[Polling] Error:', error);
  }
}, 5000); // Poll mỗi 5 giây

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
