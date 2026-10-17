// บนเครื่อง (localhost) ใช้ backend บนเครื่อง / เว็บจริงใช้ URL ของ backend บน Render
// TODO: เปลี่ยน URL ด้านล่างเป็น URL ของ Web Service บน Render (ไม่มี / ท้าย)
const PROD_API_URL = 'https://YOUR-BACKEND.onrender.com';

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const environment = {
  apiUrl: isLocal ? 'http://localhost:3000' : PROD_API_URL,
};
