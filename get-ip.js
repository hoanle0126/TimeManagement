/**
 * Script helper để lấy IP local của máy tính
 * Chạy: node get-ip.js
 */

const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Bỏ qua internal (localhost) và non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const ip = getLocalIP();
console.log('\n📱 IP của máy tính bạn:');
console.log(`   ${ip}\n`);
console.log('💡 Cập nhật file .env với:');
console.log(`   REACT_APP_API_URL=http://${ip}:8000/api\n`);

