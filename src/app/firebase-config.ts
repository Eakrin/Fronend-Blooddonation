import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// ค่านี้ไม่ใช่ความลับ ใส่ในโค้ด frontend ได้ตามปกติ
const firebaseConfig = {
  apiKey: 'AIzaSyBLddF-UrgK3CYBfAyZWR5dGCUaopkgoBU',
  authDomain: 'suttavej-blood-center.firebaseapp.com',
  projectId: 'suttavej-blood-center',
  storageBucket: 'suttavej-blood-center.firebasestorage.app',
  messagingSenderId: '392474624115',
  appId: '1:392474624115:web:e9ec63cbaffe231324ea06',
  measurementId: 'G-72CJYG2FDS',
};

// กัน error "Firebase App already exists" กรณีไฟล์นี้ถูก import ซ้ำ
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();