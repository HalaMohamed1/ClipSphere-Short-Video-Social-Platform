/**
 * Token utilities for extracting JWT from cookies
 */

/**
 * Get JWT token from localStorage or cookies
 * @returns {string | null} JWT token or null if not found
 */
export const getJWTToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  // First try localStorage (stored for Socket.io)
  const tokenFromStorage = localStorage.getItem('jwtToken');
  if (tokenFromStorage) {
    console.log('🔑 Token found in localStorage');
    return tokenFromStorage;
  }

  // Fallback to cookies
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith('token=')) {
      console.log('🔑 Token found in cookies');
      return cookie.substring(6);
    }
  }
  
  console.log('❌ No token found in localStorage or cookies');
  return null;
};

/**
 * Decode JWT token (without verification - for client-side only)
 * @param {string} token - JWT token
 * @returns {object | null} Decoded token payload or null if invalid
 */
export const decodeJWT = (token) => {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
};
