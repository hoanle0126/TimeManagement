/**
 * Application Configuration
 * 
 * API URL được đọc từ biến môi trường REACT_APP_API_URL
 * Tạo file .env trong thư mục gốc và thêm: REACT_APP_API_URL=http://your-api-url/api
 * 
 * File .env đã được thêm vào .gitignore để không commit lên git
 */

// Hàm để lấy IP local của máy tính (chỉ dùng cho development)
const getLocalIP = () => {
  // Trên web, luôn dùng localhost
  if (typeof window !== 'undefined') {
    return 'localhost';
  }
  
  // Trên native (React Native), cần dùng IP của máy tính thay vì localhost
  // Vì thiết bị không thể truy cập localhost của máy tính
  // IP 192.168.0.113 là IP local của máy tính (từ ipconfig)
  // Nếu IP thay đổi, cần cập nhật hoặc set biến môi trường REACT_APP_API_URL
  return '192.168.0.113';
};

// Đọc từ biến môi trường (được inject bởi babel-plugin-transform-inline-environment-variables)
// Trên web, process.env.REACT_APP_API_URL sẽ được đọc trực tiếp
// Trên native, babel plugin sẽ thay thế giá trị này tại build time
const API_URL = 
  typeof process !== 'undefined' && process.env?.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : __DEV__ 
      ? `http://${getLocalIP()}:8000/api`  // Fallback cho development
      : 'https://your-production-api.com/api'; // Fallback cho production

export { API_URL };

export default {
  API_URL,
};

