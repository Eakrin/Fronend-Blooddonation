const PROD_API_URL = 'https://backend-blooddonation.onrender.com';

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

export const environment = {
  apiUrl: isLocal ? 'http://localhost:3000' : PROD_API_URL,
};
