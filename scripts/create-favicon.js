/**
 * Script để tạo favicon.png từ favicon.svg
 * Yêu cầu: npm install sharp
 * Chạy: node scripts/create-favicon.js
 */

const fs = require('fs');
const path = require('path');

// Tạo một favicon PNG đơn giản (64x64) với màu xanh lá và checkmark
// Đây là một placeholder - bạn nên sử dụng công cụ chuyên nghiệp để convert SVG sang PNG

const createSimpleFavicon = () => {
  // Tạo một file PNG đơn giản bằng cách sử dụng canvas hoặc sharp
  // Vì không có canvas/sharp, chúng ta sẽ tạo một file placeholder
  
  console.log('Để tạo favicon.png, bạn có thể:');
  console.log('1. Sử dụng công cụ online: https://convertio.co/svg-png/');
  console.log('2. Hoặc cài đặt sharp và chạy script này với code đầy đủ');
  console.log('3. Hoặc sử dụng ImageMagick: magick assets/favicon.svg -resize 64x64 assets/favicon.png');
  
  // Tạm thời, chúng ta sẽ không tạo file để tránh lỗi
  // Bạn cần tạo file favicon.png thủ công hoặc sử dụng công cụ online
};

createSimpleFavicon();

