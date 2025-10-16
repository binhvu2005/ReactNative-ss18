// Cấu hình authentication
export const AUTH_CONFIG = {
  // Token hiện tại - trong thực tế nên lưu trong AsyncStorage hoặc SecureStore
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM1LCJpYXQiOjE3NjA2MDExNzgsImV4cCI6MTc2MTIwNTk3OH0.xG2APuVJv-XXQ7p63D0gs-DgMbwOjVwpBoR2KJE4_kg',
  
  // Base URL của API
  baseURL: 'https://nest-api-public.ixe-agent.io.vn/api/v1',
  
  // Timeout cho requests
  timeout: 10000,
  
  // Headers mặc định
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
};

// Helper function để lấy authorization header
export const getAuthHeader = () => {
  return {
    'Authorization': `Bearer ${AUTH_CONFIG.token}`,
  };
};

// Helper function để kiểm tra token có hợp lệ không
export const isTokenValid = () => {
  try {
    // Decode JWT token để kiểm tra expiry
    const payload = JSON.parse(atob(AUTH_CONFIG.token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// Helper function để lấy thông tin user từ token
export const getUserFromToken = () => {
  try {
    const payload = JSON.parse(atob(AUTH_CONFIG.token.split('.')[1]));
    return {
      userId: payload.sub,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};
