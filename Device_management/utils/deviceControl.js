const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * Parse URL and determine protocol (HTTP/HTTPS), host, and port
 * @param {string} url - URL string (e.g., "http://example.com:8080", "example.com:443", "example.com")
 * @returns {Object} - { protocol, host, port, useHttps }
 */
function parseUrl(url) {
  let protocol, host, port, useHttps;
  
  // Nếu có http:// hoặc https:// ở đầu
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const parsed = new URL(url);
    protocol = parsed.protocol.replace(':', '');
    host = parsed.hostname;
    port = parsed.port ? parseInt(parsed.port) : (protocol === 'https' ? 443 : 80);
    useHttps = protocol === 'https';
  } else {
    // Không có protocol, tự động phát hiện
    if (url.includes(':')) {
      [host, port] = url.split(':');
      port = parseInt(port);
    } else {
      host = url;
      port = 443; // Mặc định thử HTTPS trước
    }
    
    // Port 443 = HTTPS, còn lại = HTTP
    useHttps = (port === 443);
    protocol = useHttps ? 'https' : 'http';
  }
  
  console.log(`[ParseURL] Input: ${url} → Protocol: ${protocol}, Host: ${host}, Port: ${port}`);
  return { protocol, host, port, useHttps };
}

/**
 * Ping an IP address to check if it's online
 * @param {string} ip - IP address to ping (có thể có port: localhost:4001 hoặc 192.168.1.1)
 * @returns {Promise<boolean>} - true if online, false if offline
 */
async function pingIP(ip) { // đây chính là ip của server mà esp32 tạo ra
  try {
    // Nếu có port (localhost:4001), dùng HTTP check thay vì ping
    if (ip.includes(':')) {
      return await checkHTTP(ip);
    }
    
    // Ping bình thường cho IP không có port
    const isWindows = process.platform === 'win32';
    const pingCommand = isWindows ? `ping -n 1 -w 1000 ${ip}` : `ping -c 1 -W 1 ${ip}`;
    
    await execAsync(pingCommand);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if HTTP/HTTPS server is online, là chỗ để kiểm tra trạng thái của thiết bị
 * @param {string} ip - IP address with port (e.g., localhost:4001 or domain.com)
 * @returns {Promise<boolean>}
 */
async function checkHTTP(ip) {
  return new Promise((resolve) => {
    try {
      const { host, port, useHttps } = parseUrl(ip);
      
      const options = {
        hostname: host,
        port: port,
        path: '/is_online',
        method: 'GET',
        timeout: 2000,
        rejectUnauthorized: false
      };
      
      const protocol = useHttps ? https : http;
      
      const req = protocol.request(options, (res) => { //đây là chỗ gửi
        // GET lên cái http /is_online của esp32 và nó sẽ thực hiện API đã định nghĩa,
        // là gửi trạng thái hoạt động của thiết bị lên http /is_online này
        resolve(true);
      });
      
      req.on('error', () => {
        resolve(false);
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      
      req.end();
    } catch (error) {
      resolve(false);
    }
  });
}

/**
 * Send HTTP/HTTPS request to ESP32 to control LED
 * @param {string} ip - Device IP address (format: host:port or domain.com)
 * @param {boolean} status - true to turn on, false to turn off
 * @returns {Promise<boolean>} - true if successful, false if failed
 */
async function controlLed(ip, status) {
  return new Promise((resolve, reject) => {
    try {
      // Parse IP và port
      let host = ip;
      let port = 80; // Default port cho ESP32
      let useHttps = false;
            
      // LOG: Địa chỉ nhận điều khiển
      console.log(`[ControlLed] Request to:`, ip, '| Status:', status);
      
      // Tách host và port trước
      if (ip.includes(':')) {
        [host, port] = ip.split(':');
        port = parseInt(port);
      }
      
      // Xác định HTTPS dựa trên port hoặc domain
      if (port === 443) {
        // Port 443 = HTTPS
        useHttps = true;
      } else if (!host.includes('localhost') && 
                 !host.includes('127.0.0.1') && 
                 !host.match(/^\d+\.\d+\.\d+\.\d+/) &&
                 !ip.includes(':')) {
        // Domain không có port = mặc định HTTPS port 443
        useHttps = true;
        port = 443;
      }
      
      const postData = JSON.stringify({
        status_led: status ? 'ON' : 'OFF'
      });
      
      const options = {
        hostname: host,
        port: port,
        path: '/led',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 3000, // 3 seconds timeout
        rejectUnauthorized: false // Bỏ qua lỗi SSL certificate
      };
      
      const protocol = useHttps ? https : http;
      
      console.log(`[ControlLed] Using ${useHttps ? 'HTTPS' : 'HTTP'} to control ${ip}`);
      
      const req = protocol.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log(`Device at ${ip} responded:`, response);
            resolve(response.success === true);
          } catch (error) {
            console.log(`Device at ${ip} responded with non-JSON`);
            resolve(true); // Assume success if device responds
          }
        });
      });
      
      req.on('error', (error) => {
        console.error(`Error controlling device at ${ip}:`, error.message);
        resolve(false);
      });
      
      req.on('timeout', () => {
        req.destroy();
        console.error(`Timeout controlling device at ${ip}`);
        resolve(false);
      });
      
      req.write(postData);
      req.end();
      
    } catch (error) {
      console.error(`Exception controlling device at ${ip}:`, error);
      resolve(false);
    }
  });
}

async function controlFan(ip, status) {
  return new Promise((resolve, reject) => {
    try {
      // Parse IP và port
      let host = ip;
      let port = 80; // Default port cho ESP32
      let useHttps = false;
            
      // LOG: Địa chỉ nhận điều khiển
      console.log(`[ControlFan] Request to:`, ip, '| Status:', status);
      
      // Tách host và port trước
      if (ip.includes(':')) {
        [host, port] = ip.split(':');
        port = parseInt(port);
      }
      
      // Xác định HTTPS dựa trên port hoặc domain
      if (port === 443) {
        // Port 443 = HTTPS
        useHttps = true;
      } else if (!host.includes('localhost') && 
                 !host.includes('127.0.0.1') && 
                 !host.match(/^\d+\.\d+\.\d+\.\d+/) &&
                 !ip.includes(':')) {
        // Domain không có port = mặc định HTTPS port 443
        useHttps = true;
        port = 443;
      }
      
      const postData = JSON.stringify({
        status_fan: status ? 'ON' : 'OFF'
      });
      
      const options = {
        hostname: host,
        port: port,
        path: '/fan',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 3000, // 3 seconds timeout
        rejectUnauthorized: false // Bỏ qua lỗi SSL certificate
      };
      
      const protocol = useHttps ? https : http;
      
      console.log(`[ControlFan] Using ${useHttps ? 'HTTPS' : 'HTTP'} to control ${ip}`);
      
      const req = protocol.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log(`Device at ${ip} responded:`, response);
            resolve(response.success === true);
          } catch (error) {
            console.log(`Device at ${ip} responded with non-JSON`);
            resolve(true); // Assume success if device responds
          }
        });
      });
      
      req.on('error', (error) => {
        console.error(`Error controlling device at ${ip}:`, error.message);
        resolve(false);
      });
      
      req.on('timeout', () => {
        req.destroy();
        console.error(`Timeout controlling device at ${ip}`);
        resolve(false);
      });
      
      req.write(postData);
      req.end();
      
    } catch (error) {
      console.error(`Exception controlling device at ${ip}:`, error);
      resolve(false);
    }
  });
}

/**
 * @param {boolean} enabled - true to turn on, false to turn off
 */
/**
 * @param {string} method - encryption method to set
 */
async function toggle_encryption_and_method(ip, enabled, method) {
  return new Promise((resolve, reject) => {
    try {
      // Parse IP và port
      let host = ip;
      let port = 80; // Default port cho ESP32
      let useHttps = false;
            
      // LOG: Địa chỉ nhận điều khiển
      console.log(`[ToggleEncryption] Request to:`, ip, '| Enabled:', enabled);
      
      // Tách host và port trước
      if (ip.includes(':')) {
        [host, port] = ip.split(':');
        port = parseInt(port);
      }
      
      // Xác định HTTPS dựa trên port hoặc domain
      if (port === 443) {
        // Port 443 = HTTPS
        useHttps = true;
      } else if (!host.includes('localhost') && 
                 !host.includes('127.0.0.1') && 
                 !host.match(/^\d+\.\d+\.\d+\.\d+/) &&
                 !ip.includes(':')) {
        // Domain không có port = mặc định HTTPS port 443
        useHttps = true;
        port = 443;
      }
      
      const postData = JSON.stringify({
        enable_encryption: enabled ? 'ON' : 'OFF',
        encryption_method: method
      });
      
      const options = {
        hostname: host,
        port: port,
        path: '/encryption',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 3000, // 3 seconds timeout
        rejectUnauthorized: false // Bỏ qua lỗi SSL certificate
      };
      
      const protocol = useHttps ? https : http;
      
      console.log(`[ToggleEncryption] Using ${useHttps ? 'HTTPS' : 'HTTP'} to control ${ip}`);
      
      const req = protocol.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response.success === true);
          } catch (error) {
            console.log(`Device at ${ip} responded with non-JSON`);
            resolve(true); // Assume success if device responds
          }
        });
      });
      
      req.on('error', (error) => {
        console.error(`Error toggling encryption at ${ip}:`, error.message);
        resolve(false);
      });
      
      req.on('timeout', () => {
        req.destroy();
        console.error(`Timeout toggling encryption at ${ip}`);
        resolve(false);
      });
      
      req.write(postData);
      req.end();
      
    } catch (error) {
      console.error(`Exception toggling encryption at ${ip}:`, error);
      resolve(false);
    }
  });
}

/**
 * Get data from ESP32
 * @param {string} ip - Device IP address (format: host:port or domain.com)
 * @returns {Promise<Object|null>} - Sensor data or null if failed
 */
async function getData(ip) { // đây chính là hàm mà khi gọi, server sẽ lên API mà
  // server của esp32 đã định nghĩa để lấy dữ liệu cảm biến
  return new Promise((resolve) => {
    try {
      let host = ip;
      let port = 80;
      let useHttps = false;
      
      // Tách host và port trước
      if (ip.includes(':')) {
        [host, port] = ip.split(':');
        port = parseInt(port);
      }
      
      // Xác định HTTPS dựa trên port hoặc domain
      if (port === 443) {
        // Port 443 = HTTPS
        useHttps = true;
      } else if (!host.includes('localhost') && 
                 !host.includes('127.0.0.1') && 
                 !host.match(/^\d+\.\d+\.\d+\.\d+/) &&
                 !ip.includes(':')) {
        // Domain không có port = mặc định HTTPS port 443
        useHttps = true;
        port = 443;
      }
      
      const options = {
        hostname: host,
        port: port,
        path: '/data_from_esp32', 
        method: 'GET',
        timeout: 3000,
        rejectUnauthorized: false // Bỏ qua lỗi SSL certificate
      };
      
      const protocol = useHttps ? https : http;
      console.log(`Đã đến chỗ này rồi1`);
      const req = protocol.request(options, (res) => {
        let data = '';
        console.log(`Đã đến chỗ này rồi2`);
        res.on('data', (chunk) => {
          data += chunk;
        });
    
        res.on('end', () => {
          try {
            const Data = JSON.parse(data);
            console.log(`Data from ${ip}:`, Data);
            resolve(Data);
          } catch (error) {
            console.error(`Invalid sensor data from ${ip}`);
            resolve(null);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error(`Error getting sensor data frommmmmmmmm ${ip}:`, error.message);
        resolve(null);
      });
      
      req.on('timeout', () => {
        req.destroy();
        console.error(`Timeout getting sensor data from ${ip}`);
        resolve(null);
      });
      
      req.end();
      
    } catch (error) {
      console.error(`Exception getting sensor data from ${ip}:`, error);
      resolve(null);
    }
  });
}

/**
 * Check status of all rooms and update their online status
 * @param {Array} rooms - Array of Room model instances
 * @returns {Promise<void>}
 */
async function checkAllRoomsStatus(rooms) {
  const promises = rooms.map(async (room) => {
    const is_online = await pingIP(room.ip);
    if (room.is_online !== is_online) {
      room.is_online = is_online;
      await room.save();
      console.log(`Trạng thái của phòng sau ping ${room.is_online}`);
    }
  });
  
  await Promise.all(promises);
}

module.exports = {
  pingIP,
  controlLed,
  controlFan,
  getData,
  checkAllRoomsStatus,
  toggle_encryption_and_method
};
