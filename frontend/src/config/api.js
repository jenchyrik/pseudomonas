export const API_BASE_URL = 'http://localhost:3001'

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    loginHistory: '/auth/login-history',
  },
}

export const getApiUrl = endpoint => `${API_BASE_URL}${endpoint}`
