/**
 * Script kiểm tra cấu hình Android SDK cho kết nối USB
 * Chạy: node check-android-setup.js
 */

const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

console.log('\n🔍 Kiểm tra cấu hình Android SDK...\n');

// Kiểm tra adb
try {
  const adbVersion = execSync('adb version', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('✅ ADB đã được cài đặt:');
  console.log(`   ${adbVersion.split('\n')[0]}\n`);
  
  // Kiểm tra thiết bị kết nối
  try {
    const devices = execSync('adb devices', { encoding: 'utf-8' });
    const deviceLines = devices.split('\n').filter(line => line.trim() && !line.includes('List of devices'));
    
    if (deviceLines.length > 0) {
      console.log('✅ Thiết bị Android đã kết nối:');
      deviceLines.forEach(line => {
        const parts = line.split('\t');
        const status = parts[1] || 'unknown';
        const statusIcon = status === 'device' ? '✅' : '⚠️';
        console.log(`   ${statusIcon} ${parts[0]} (${status})`);
      });
      console.log('\n💡 Bạn có thể chạy: npm run android\n');
    } else {
      console.log('⚠️  Không có thiết bị Android nào được kết nối.\n');
      console.log('📱 Hãy đảm bảo:');
      console.log('   1. Đã bật USB Debugging trên điện thoại');
      console.log('   2. Đã kết nối điện thoại với máy tính qua USB');
      console.log('   3. Đã chấp nhận "Allow USB debugging" trên điện thoại\n');
    }
  } catch (error) {
    console.log('⚠️  Không thể kiểm tra thiết bị.\n');
  }
  
} catch (error) {
  console.log('❌ ADB chưa được cài đặt hoặc chưa có trong PATH.\n');
  console.log('📥 Hướng dẫn cài đặt:\n');
  console.log('1. Tải Android SDK Platform Tools:');
  console.log('   https://developer.android.com/tools/releases/platform-tools\n');
  console.log('2. Giải nén vào thư mục, ví dụ: C:\\platform-tools\n');
  console.log('3. Cấu hình Environment Variables:');
  console.log('   - Mở System Properties → Environment Variables');
  console.log('   - Thêm biến ANDROID_HOME = C:\\platform-tools');
  console.log('   - Thêm %ANDROID_HOME% vào PATH');
  console.log('   - Khởi động lại terminal\n');
  console.log('4. Kiểm tra lại: node check-android-setup.js\n');
}

// Kiểm tra biến môi trường
const androidHome = process.env.ANDROID_HOME;
if (androidHome) {
  console.log(`✅ ANDROID_HOME đã được set: ${androidHome}`);
} else {
  console.log('⚠️  ANDROID_HOME chưa được set trong environment variables.');
}

console.log('');

