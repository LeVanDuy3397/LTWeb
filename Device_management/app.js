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

//Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('A user connected');
  // ... handle real-time events ...
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Background job: Poll sensor data từ ESP32 mỗi 5 giây, tức cả khi ESP32 không chủ động gửi
const { getData } = require('./utils/deviceControl');
const Room = require('./models/Room');
const RoomHistory = require('./models/RoomHistory');
const crypto = require('crypto');
const SIMPLE_KEY1 = '165743'; // khóa cố định

// Tạo AES key 32 bytes từ key đơn giản (giống ESP32)
function generateKey(password) {
  return crypto.createHash('sha256').update(password).digest();
}

// Giải mã AES-256-CBC
function decryptAES(encryptedBase64) {
  try {
    // Tạo key và IV (phải giống ESP32)
    const key = generateKey(SIMPLE_KEY1);
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

setInterval(async () => {
  try {
    const rooms = await Room.findAll({ where: { is_online: true } });
    if (rooms.length === 0) {
      console.log("Không có room nào online");
    } else {
      console.log(`Có ${rooms.length} roomsssssssssssssss online`);
    }

    for (const room of rooms) {
      console.log(`Có ${room.length} room online`);
      const data_from_esp32 = await getData(room.ip); // đây là chỗ server mỗi 5s sẽ lên
      // đường dẫn http://<room.ip>/sensor để lấy dữ liệu cảm biến rồi hiển thị và lưu vào database
      console.log(`[Polling] Fetched data frommmmmmmmm ${room.name} (${room.ip}):`, data_from_esp32);
      // Lưu vào database
      if (data_from_esp32==null) {
        await room.update({ is_online: false });
        await room.save();

        io.emit('data_from_esp32_update', {
          roomId: room.id,
          roomName: room.name,
          temperature: null,
          humidity: null,
          status_led: null,
          status_fan: null,
          is_online: false,
          enable_encryption: false,
          timestamp: new Date()
        });

        console.log(`[Polling] Room ${room.name} is offline.`);
        continue;
        }

        let decryptedHumidity = null;
        if(room.humidityEncryption.enabled==true){
          // Broadcast realtime
          io.emit('data_from_esp32_update', {
            roomId: room.id,
            roomName: room.name,
            temperature: data_from_esp32.temperature,
            humidity: data_from_esp32.humidity, // giá trị mã hóa đang là string (hex)
            status_led: data_from_esp32.status_led,
            status_fan: data_from_esp32.status_fan,
            is_online: data_from_esp32.is_online,
            enable_encryption: true,
            encryption_method: room.humidityEncryption.method,
            timestamp: new Date()
          });
          // Giải mã độ ẩm
          if (room.humidityEncryption.method == "DES") {
            console.log('Humidity chưa được mã hóa DES');
            decryptedHumidity = data_from_esp32.humidity;
          }
          else if (room.humidityEncryption.method == "AES-256") {
            console.log('Humidity sau mã hóa AES-256: ', data_from_esp32.humidity);
            decryptedHumidity = decryptAES(data_from_esp32.humidity);
            console.log('Humidity sau giải mã AES-256:', decryptedHumidity);
          }
          try {
            await RoomHistory.create({
              roomId: room.id,
              temperature: parseFloat(data_from_esp32.temperature),
              humidity: parseFloat(decryptedHumidity),
              status_led: data_from_esp32.status_led=="ON"? true : false,
              status_fan: data_from_esp32.status_fan=="ON"? true : false,
              createdAt: new Date()
              });
            } catch (saveError) {
            console.error(`[Polling] Error saving data for ${room.name}:`, saveError);
          }
        }
        else{
          // Broadcast realtime
          try {
          await RoomHistory.create({
            roomId: room.id,
            temperature: parseFloat(data_from_esp32.temperature),
            humidity: parseFloat(data_from_esp32.humidity),
            status_led: data_from_esp32.status_led=="ON"? true : false,
            status_fan: data_from_esp32.status_fan=="ON"? true : false,
            createdAt: new Date()
            });
          } catch (saveError) {
          console.error(`[Polling] Error saving data for ${room.name}:`, saveError);
          }

          io.emit('data_from_esp32_update', {
            roomId: room.id,
            roomName: room.name,
            temperature: data_from_esp32.temperature,
            humidity: data_from_esp32.humidity, // giá trị dạng string
            status_led: data_from_esp32.status_led,
            status_fan: data_from_esp32.status_fan,
            is_online: data_from_esp32.is_online,
            enable_encryption: false,
            timestamp: new Date()
          });
          console.log(`Đã gửi dữ liệu cho phòng ${room.name}.`);
        }
        console.log(`[Polling] Room ${room.name}: ${data_from_esp32.temperature}°C, ${decryptedHumidity ? decryptedHumidity : data_from_esp32.humidity}%, Status LED: ${room.status_led ? 'ON' : 'OFF'}, Status Fan: ${room.status_fan ? 'ON' : 'OFF'}`);
    }
  } catch (error) {
    console.error('[Polling] Error:', error);
  }
}, 5000); // Poll mỗi 5 giây

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
